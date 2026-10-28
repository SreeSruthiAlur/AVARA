import 'dart:convert';

import 'package:google_generative_ai/google_generative_ai.dart';
import 'package:http/http.dart' as http;

// ---------------------------------------------------------------------------
// Callback typedef
// ---------------------------------------------------------------------------

/// Platform-provided callback that runs the Swiss Ephemeris math engine.
///
/// [year], [month], [day] are the **UTC** date components (already adjusted
/// from the local IST birth time).  [hourUtc] is the decimal UTC hour
/// (e.g. 8.5 = 08:30 UTC).  [lat] / [lon] are WGS-84 geocoded coordinates.
///
/// Returns the full kundali [Map] produced by [TeluguKundaliCalculator].
typedef ChartGeneratorCallback = Future<Map<String, dynamic>> Function({
  required int year,
  required int month,
  required int day,
  required double hourUtc,
  required double lat,
  required double lon,
});

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/// AVARA's Gemini-powered Vedic Astrology conversational engine.
///
/// ### Two usage modes
/// | Mode | How to start | When to use |
/// |------|-------------|-------------|
/// | **Chat-first** | Just call [sendMessage] | Standalone launch; AVARA asks for birth details when needed and fires the `calculate_chart` tool automatically |
/// | **Chart-first** | Call [preloadChart] then [sendMessage] | After the Birth Profile screen; the pre-computed kundali is injected into the first turn silently |
class AIAstrologyService {
  // -------------------------------------------------------------------------
  // System instruction & tool declaration (compile-time constants)
  // -------------------------------------------------------------------------

  static const String _kSystemInstruction =
      'You are AVARA, an expert Vedic Astrology AI. Greet the user naturally. '
      'Answer general astrology questions directly. '
      'If a user asks a personal question that requires their chart, politely ask '
      'for their Date, Time, and City of birth in a single message. '
      'Once they provide these, you MUST call the calculate_birth_chart function. '
      'Do not hallucinate chart details.';

  static const String _kToolName = 'calculate_birth_chart';

  static final Tool _kChartTool = Tool(
    functionDeclarations: [
      FunctionDeclaration(
        _kToolName,
        'Calculates the Vedic Janma Kundali (birth chart) from date, time, '
        'and city of birth. Call this as soon as the user provides their '
        'birth details — do NOT ask for additional confirmation.',
        Schema(
          SchemaType.object,
          properties: {
            'date': Schema(
              SchemaType.string,
              description: 'Birth date in YYYY-MM-DD format.',
            ),
            'time': Schema(
              SchemaType.string,
              description:
                  'Birth time in HH:MM 24-hour local time. IST (UTC+5:30) '
                  'is assumed unless the user specifies otherwise.',
            ),
            'city': Schema(
              SchemaType.string,
              description:
                  'City of birth, used for geocoding latitude/longitude.',
            ),
          },
          requiredProperties: ['date', 'time', 'city'],
        ),
      ),
    ],
  );

  // -------------------------------------------------------------------------
  // Fields
  // -------------------------------------------------------------------------

  final GenerativeModel _model;
  late ChatSession _chat;
  final ChartGeneratorCallback? _chartGenerator;

  /// The most recently computed kundali, populated after [preloadChart] or
  /// after the model fires the [_kToolName] function call.
  Map<String, dynamic>? _chartJson;

  /// Prevents the pre-loaded chart from being injected more than once.
  bool _chartInjected = false;

  /// Expose the current chart so the UI can react (e.g. show a chart-viewer).
  Map<String, dynamic>? get chartJson => _chartJson;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  /// Creates an [AIAstrologyService].
  ///
  /// - [apiKey]         : Google AI Studio API key (required).
  /// - [modelName]      : Gemini model variant. Defaults to `gemini-1.5-flash`.
  /// - [chartGenerator] : Platform callback that runs the sweph math engine.
  ///                      Must be provided for the `calculate_chart` tool to work.
  AIAstrologyService({
    required String apiKey,
    String modelName = 'gemini-3.8-flash',
    this._chartGenerator, // type inferred from field ChartGeneratorCallback?
  }) : _model = GenerativeModel(
          model: modelName,
          apiKey: apiKey,
          systemInstruction: Content.system(_kSystemInstruction),
          tools: [_kChartTool],
        ) {
    _chat = _model.startChat();
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /// Pre-loads an already-computed kundali into the service.
  ///
  /// The chart data is silently prepended to the **first** [sendMessage] call
  /// so AVARA can answer personal questions immediately without prompting the
  /// user for birth details again.  Typical use: navigate from the Birth
  /// Profile screen after a kundali has already been calculated.
  void preloadChart(Map<String, dynamic> chartJson) {
    _chartJson = chartJson;
    _chartInjected = false; // will be injected on the next send
  }

  /// Sends [userPrompt] to AVARA and returns the text response.
  ///
  /// Manages the full Gemini function-calling loop internally:
  /// 1. User message is sent (with chart context prepended on first turn if
  ///    [preloadChart] was called).
  /// 2. If the model fires `calculate_chart`, [_executeCalculateChart] runs
  ///    the geocoding + sweph pipeline and feeds the result back.
  /// 3. Steps 1-2 repeat until the model returns a plain text response.
  ///
  /// Throws [AIAstrologyException] on API errors, empty responses, or tool
  /// execution failures.
  Future<String> sendMessage(String userPrompt) async {
    try {
      // Inject pre-loaded chart context silently on the first turn.
      final String prompt;
      if (_chartJson != null && !_chartInjected) {
        final chartData = jsonEncode(_jsonSafe(_chartJson!));
        prompt = 'LOADED BIRTH CHART DATA (JSON):\n$chartData'
            '\n\n---\nUSER QUESTION:\n$userPrompt';
        _chartInjected = true;
      } else {
        prompt = userPrompt;
      }

      var response = await _chat.sendMessage(Content.text(prompt));

      // Agentic tool-call loop — Gemini may chain multiple calls.
      while (response.functionCalls.isNotEmpty) {
        final call = response.functionCalls.first;
        if (call.name == _kToolName) {
          final toolResult = await _executeCalculateChart(call.args);
          // NOTE: Content.functionResponse() in google_generative_ai 0.4.7
          // hard-codes role 'function', which the Gemini 3.x API rejects with
          // "Role 'function' is not supported". Send the FunctionResponse part
          // under the valid 'user' role instead, wrapping the tool output
          // under 'result' as the function-response payload.
          response = await _chat.sendMessage(
            Content('user', [
              FunctionResponse(call.name, {'result': toolResult}),
            ]),
          );
        } else {
          // Unknown tool — break to avoid an infinite loop.
          break;
        }
      }

      final text = response.text;
      if (text == null || text.isEmpty) {
        throw AIAstrologyException(
          'AVARA returned an empty response. Please try again.',
        );
      }
      return text;
    } on GenerativeAIException catch (e) {
      throw AIAstrologyException('Gemini API error: ${e.message}', cause: e);
    } on AIAstrologyException {
      rethrow;
    } catch (e) {
      throw AIAstrologyException('Unexpected error while contacting AVARA: $e');
    }
  }

  /// Clears the chat history and any stored chart state, starting a fresh
  /// conversation session.
  void clearHistory() {
    _chat = _model.startChat();
    _chartJson = null;
    _chartInjected = false;
  }

  // -------------------------------------------------------------------------
  // Tool execution
  // -------------------------------------------------------------------------

  /// Executes the `calculate_chart` tool call end-to-end:
  /// 1. Parses [args] (`date`, `time`, `city`).
  /// 2. Converts local IST birth time → UTC.
  /// 3. Geocodes [city] via the Nominatim API.
  /// 4. Runs the sweph math engine through [_chartGenerator].
  /// 5. Stores the result in [_chartJson] and returns it as a JSON-safe map
  ///    for the model to read as the function response.
  Future<Map<String, Object?>> _executeCalculateChart(
    Map<String, Object?> args,
  ) async {
    final date = args['date']?.toString() ?? '';
    final time = args['time']?.toString() ?? '';
    final city = args['city']?.toString() ?? '';

    try {
      // 1. Parse date  (YYYY-MM-DD)
      final dateParts = date.split('-');
      if (dateParts.length != 3) {
        return {
          'error': 'Invalid date format — expected YYYY-MM-DD, got "$date".',
        };
      }
      final year = int.parse(dateParts[0]);
      final month = int.parse(dateParts[1]);
      final day = int.parse(dateParts[2]);

      // 2. Parse time (HH:MM) and convert local IST → UTC
      final timeParts = time.split(':');
      if (timeParts.length < 2) {
        return {
          'error': 'Invalid time format — expected HH:MM, got "$time".',
        };
      }
      final localH = int.parse(timeParts[0]);
      final localM = int.parse(timeParts[1]);
      const istOffsetMinutes = 330; // IST = UTC+05:30
      int utcMinutes = (localH * 60 + localM) - istOffsetMinutes;
      int dayDelta = 0;
      if (utcMinutes < 0) {
        utcMinutes += 1440;
        dayDelta = -1;
      } else if (utcMinutes >= 1440) {
        utcMinutes -= 1440;
        dayDelta = 1;
      }
      final utcDate =
          DateTime.utc(year, month, day).add(Duration(days: dayDelta));
      final hourDecimal =
          utcMinutes ~/ 60 + (utcMinutes % 60) / 60.0;

      // 3. Geocode the city via Nominatim (OpenStreetMap)
      final encoded = Uri.encodeComponent(city);
      final geoUri = Uri.parse(
        'https://nominatim.openstreetmap.org/search'
        '?q=$encoded&format=json&limit=1',
      );
      final geoResponse = await http.get(geoUri, headers: {
        'User-Agent': 'AVARA-Astrology/1.0 (contact@avara.example)',
      });
      if (geoResponse.statusCode != 200) {
        return {
          'error':
              'Geocoding service unavailable (HTTP ${geoResponse.statusCode}).'
              ' Please try again.',
        };
      }
      final geoResults = (jsonDecode(geoResponse.body) as List);
      if (geoResults.isEmpty) {
        return {
          'error':
              'Could not find coordinates for "$city". '
              'Please try a more specific city name.',
        };
      }
      final lat = double.parse(geoResults[0]['lat'].toString());
      final lon = double.parse(geoResults[0]['lon'].toString());
      final resolvedCity =
          geoResults[0]['display_name']?.toString() ?? city;

      // 4. Run sweph via the injected platform callback
      if (_chartGenerator == null) {
        return {
          'error':
              'The chart calculation engine is not available in this context.',
        };
      }
      final chart = await _chartGenerator(
        year: utcDate.year,
        month: utcDate.month,
        day: utcDate.day,
        hourUtc: hourDecimal,
        lat: lat,
        lon: lon,
      );
      _chartJson = chart;

      // 5. Return JSON-safe chart data to the model as the function response.
      return <String, Object?>{
        'status': 'success',
        'resolved_city': resolvedCity,
        'chart': _jsonSafe(chart) as Object,
      };
    } catch (e) {
      return {'error': 'Chart calculation failed unexpectedly: $e'};
    }
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  /// Recursively converts all [Map] keys to [String] so that [jsonEncode]
  /// never encounters a non-String key (e.g. `int` keys in `rasi_to_planets`
  /// from [TeluguKundaliCalculator]).
  dynamic _jsonSafe(dynamic value) {
    if (value is Map) {
      return value.map(
        (dynamic k, dynamic v) => MapEntry(k.toString(), _jsonSafe(v)),
      );
    }
    if (value is List) {
      return value.map(_jsonSafe).toList(growable: false);
    }
    return value;
  }
}

// ---------------------------------------------------------------------------
// Exception
// ---------------------------------------------------------------------------

/// Exception thrown by [AIAstrologyService] on inference or tool-call errors.
class AIAstrologyException implements Exception {
  /// Human-readable error description.
  final String message;

  /// The underlying exception that caused this, if any.
  final Object? cause;

  const AIAstrologyException(this.message, {this.cause});

  @override
  String toString() => cause != null
      ? 'AIAstrologyException: $message\n  Caused by: $cause'
      : 'AIAstrologyException: $message';
}
