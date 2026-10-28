import 'dart:io';
import 'package:path/path.dart' as p;
import 'package:sweph/sweph.dart';

/// `true` when running in a web (JS/WASM) environment.
///
/// Mirrors `package:flutter/foundation.dart`'s `kIsWeb`. Defined locally rather
/// than importing Flutter so this file stays usable from pure Dart — the CLI
/// (`dart run bin/main.dart`) runs on the standalone VM, where `dart:ui`
/// (pulled in transitively by Flutter's foundation) is unavailable. On the web,
/// `dart:io`'s `Platform` throws `Unsupported operation: Platform._operatingSystem`,
/// so every `Platform.is*` and native `File` access must be guarded with this.
const bool kIsWeb = bool.fromEnvironment('dart.library.js_interop');

/// A class for calculating Vedic Astrology (Janma Kundali) using various Ayanamsas
/// with Telugu terminology for Rasi and Nakshatra.
class TeluguKundaliCalculator {
  bool _initialized = false;
  String? _modulePath;
  SiderealMode _ayanamsaMode = SiderealMode.SE_SIDM_LAHIRI;
  String _ayanamsaName = 'Lahiri';

  // Ephemeris asset loading (used on Flutter to load bundled ephe files).
  final List<String> _epheAssets;
  final AssetLoader? _assetLoader;
  final String? _epheFilesPath;

  /// Creates a calculator.
  ///
  /// [modulePath] optional path to the native sweph library; when omitted the
  /// calculator tries to locate it in the pub cache (desktop) or falls back to
  /// Flutter's FFI plugin loading (mobile).
  /// [ayanamsa] 1 = Lahiri (default), 2 = Raman, 3 = KP.
  /// [epheAssets], [assetLoader] and [epheFilesPath] enable loading the
  /// ephemeris files bundled with the sweph package on Flutter; leave them
  /// empty/null for the vanilla Dart / CLI usage.
  TeluguKundaliCalculator({
    this._modulePath,
    int ayanamsa = 1,
    this._epheAssets = const [],
    this._assetLoader,
    this._epheFilesPath,
  }) {
    setAyanamsa(ayanamsa);
  }

  void setAyanamsa(int ayanamsa) {
    switch (ayanamsa) {
      case 2:
        _ayanamsaMode = SiderealMode.SE_SIDM_RAMAN;
        _ayanamsaName = 'Raman';
        break;
      case 3:
        _ayanamsaMode = SiderealMode.SE_SIDM_KRISHNAMURTI;
        _ayanamsaName = 'KP';
        break;
      case 1:
      default:
        _ayanamsaMode = SiderealMode.SE_SIDM_LAHIRI;
        _ayanamsaName = 'Lahiri';
    }
    _initialized = false;
  }

  String get ayanamsaName => _ayanamsaName;

  Future<void> initialize({double lat = 0.0, double lon = 0.0}) async {
    if (_initialized) return;

    _modulePath ??= _findNativeLibrary();

    await Sweph.init(
      modulePath: _modulePath,
      epheAssets: _epheAssets,
      assetLoader: _assetLoader,
      epheFilesPath: _epheFilesPath,
    );

    Sweph.swe_set_topo(lon, lat, 0.0);

    Sweph.swe_set_sid_mode(
      _ayanamsaMode,
      SiderealModeFlag.SE_SIDBIT_NONE,
    );

    _initialized = true;
  }

  String? _findNativeLibrary() {
    // On the web there is no native library and `dart:io`'s `Platform` throws,
    // so skip native path extraction entirely and let sweph load via WASM.
    if (kIsWeb) {
      return null;
    }
    if (Platform.isWindows) {
      final dll = File(p.join(
        Platform.environment['USERPROFILE'] ?? '',
        'AppData',
        'Local',
        'Pub',
        'Cache',
        'hosted',
        'pub.dev',
        'sweph-3.2.1+2.10.3',
        'example.dart',
        'sweph.dll',
      ));
      if (dll.existsSync()) return dll.path;
    } else if (Platform.isLinux) {
      final so = File(p.join(
        Platform.environment['HOME'] ?? '',
        '.pub-cache',
        'hosted',
        'pub.dev',
        'sweph-3.2.1+2.10.3',
        'example.dart',
        'libsweph.so',
      ));
      if (so.existsSync()) return so.path;
    } else if (Platform.isMacOS) {
      final dylib = File(p.join(
        Platform.environment['HOME'] ?? '',
        '.pub-cache',
        'hosted',
        'pub.dev',
        'sweph-3.2.1+2.10.3',
        'example.dart',
        'libsweph.dylib',
      ));
      if (dylib.existsSync()) return dylib.path;
    }
    return null;
  }

  Future<Map<String, dynamic>> calculateFullKundali(
    int year,
    int month,
    int day,
    double hourUTC,
    double lat,
    double lon,
  ) async {
    await initialize(lat: lat, lon: lon);

    final julianDay = Sweph.swe_julday(year, month, day, hourUTC, CalendarType.SE_GREG_CAL);

    // Navagrahas are calculated strictly geocentric (sidereal + Swiss Ephemeris).
    // SEFLG_TOPOCTR is intentionally omitted so the swe_set_topo() call in
    // initialize() does not pull the planets into a topocentric frame; the
    // observer position set there remains reserved for the Lagna / house cusps
    // computed via swe_houses() below. SEFLG_SPEED is kept so 'is_retrograde'
    // stays populated.
    final flags = SwephFlag.SEFLG_SIDEREAL |
        SwephFlag.SEFLG_SPEED |
        SwephFlag.SEFLG_SWIEPH;

    final planets = <String, Map<String, dynamic>>{};

    planets['Sun'] = _calcPlanet(julianDay, HeavenlyBody.SE_SUN, flags, 'Sun', 'Su');
    planets['Moon'] = _calcPlanet(julianDay, HeavenlyBody.SE_MOON, flags, 'Moon', 'Mo');
    planets['Mars'] = _calcPlanet(julianDay, HeavenlyBody.SE_MARS, flags, 'Mars', 'Ma');
    planets['Mercury'] = _calcPlanet(julianDay, HeavenlyBody.SE_MERCURY, flags, 'Mercury', 'Me');
    planets['Jupiter'] = _calcPlanet(julianDay, HeavenlyBody.SE_JUPITER, flags, 'Jupiter', 'Ju');
    planets['Venus'] = _calcPlanet(julianDay, HeavenlyBody.SE_VENUS, flags, 'Venus', 'Ve');
    planets['Saturn'] = _calcPlanet(julianDay, HeavenlyBody.SE_SATURN, flags, 'Saturn', 'Sa');
    planets['Rahu'] = _calcPlanet(julianDay, HeavenlyBody.SE_MEAN_NODE, flags, 'Rahu', 'Ra');

    final ketuLon = _normalizeLongitude(planets['Rahu']!['sidereal_longitude'] + 180.0);
    final ketuRasiIndex = _getRasiIndex(ketuLon);
    planets['Ketu'] = {
      'name': 'Ketu',
      'abbreviation': 'Ke',
      'sidereal_longitude': ketuLon,
      'latitude': 0.0,
      'distance_au': 0.0,
      'speed_longitude': planets['Rahu']!['speed_longitude'],
      'degrees_in_rasi': _getDegreesInSign(ketuLon),
      'rasi_index': ketuRasiIndex,
      'rasi_name_telugu': _teluguRasiNames[ketuRasiIndex],
      'rasi_name_sanskrit': _sanskritRasiNames[ketuRasiIndex],
      'nakshatra_index': _getNakshatraIndex(ketuLon),
      'nakshatra_name_telugu': _teluguNakshatraNames[_getNakshatraIndex(ketuLon)],
      'nakshatra_name_sanskrit': _sanskritNakshatraNames[_getNakshatraIndex(ketuLon)],
      'nakshatra_lord': _nakshatraLords[_getNakshatraIndex(ketuLon)],
      'pada': _getPada(ketuLon),
      'degrees_in_nakshatra': _getDegreesInNakshatra(ketuLon),
      'is_retrograde': true,
    };

    final ayanamsa = Sweph.swe_get_ayanamsa(julianDay);

    final housesTropical = Sweph.swe_houses(julianDay, lat, lon, Hsys.W);
    double tropicalAsc = housesTropical.ascmc[0];
    double siderealAsc = tropicalAsc - ayanamsa;
    siderealAsc = _normalizeLongitude(siderealAsc);
    
    final ascendantRasiIndex = _getRasiIndex(siderealAsc);
    final lagna = {
      'name': 'Lagna',
      'abbreviation': 'As',
      'sidereal_longitude': siderealAsc,
      'tropical_longitude': tropicalAsc,
      'latitude': 0.0,
      'distance_au': 0.0,
      'speed_longitude': 0.0,
      'degrees_in_rasi': _getDegreesInSign(siderealAsc),
      'rasi_index': ascendantRasiIndex,
      'rasi_name_telugu': _teluguRasiNames[ascendantRasiIndex],
      'rasi_name_sanskrit': _sanskritRasiNames[ascendantRasiIndex],
      'nakshatra_index': _getNakshatraIndex(siderealAsc),
      'nakshatra_name_telugu': _teluguNakshatraNames[_getNakshatraIndex(siderealAsc)],
      'nakshatra_name_sanskrit': _sanskritNakshatraNames[_getNakshatraIndex(siderealAsc)],
      'nakshatra_lord': _nakshatraLords[_getNakshatraIndex(siderealAsc)],
      'pada': _getPada(siderealAsc),
      'degrees_in_nakshatra': _getDegreesInNakshatra(siderealAsc),
      'is_retrograde': false,
    };

    final rasiToPlanets = _groupPlanetsByRasi(planets, lagna);

    return {
      'julian_day': julianDay,
      'timestamp_utc': _formatTimestamp(year, month, day, hourUTC),
      'location': {'latitude': lat, 'longitude': lon},
      'ayanamsa': ayanamsa,
      'ayanamsa_name': _ayanamsaName,
      'planets': planets,
      'lagna': lagna,
      'rasi_to_planets': rasiToPlanets,
      'south_indian_chart': generateSouthIndianChart(rasiToPlanets),
    };
  }

  Map<String, dynamic> _calcPlanet(
    double julianDay,
    HeavenlyBody body,
    SwephFlag flags,
    String name,
    String abbreviation,
  ) {
    final result = Sweph.swe_calc_ut(julianDay, body, flags);
    final lon = _normalizeLongitude(result.longitude);
    final rasiIndex = _getRasiIndex(lon);
    final nakshatraIndex = _getNakshatraIndex(lon);

    return {
      'name': name,
      'abbreviation': abbreviation,
      'sidereal_longitude': lon,
      'latitude': result.latitude,
      'distance_au': result.distance,
      'speed_longitude': result.speedInLongitude,
      'degrees_in_rasi': _getDegreesInSign(lon),
      'rasi_index': rasiIndex,
      'rasi_name_telugu': _teluguRasiNames[rasiIndex],
      'rasi_name_sanskrit': _sanskritRasiNames[rasiIndex],
      'nakshatra_index': nakshatraIndex,
      'nakshatra_name_telugu': _teluguNakshatraNames[nakshatraIndex],
      'nakshatra_name_sanskrit': _sanskritNakshatraNames[nakshatraIndex],
      'nakshatra_lord': _nakshatraLords[nakshatraIndex],
      'pada': _getPada(lon),
      'degrees_in_nakshatra': _getDegreesInNakshatra(lon),
      'is_retrograde': result.speedInLongitude < 0,
    };
  }

  Map<int, List<String>> _groupPlanetsByRasi(
    Map<String, Map<String, dynamic>> planets,
    Map<String, dynamic> lagna,
  ) {
    final rasiMap = <int, List<String>>{};
    for (int i = 0; i < 12; i++) {
      rasiMap[i] = [];
    }
    for (final entry in planets.entries) {
      final planet = entry.value;
      final rasiIndex = planet['rasi_index'] as int;
      final abbr = planet['abbreviation'] as String;
      final isRetro = planet['is_retrograde'] as bool;
      final display = isRetro ? '${abbr}R' : abbr;
      rasiMap[rasiIndex]!.add(display);
    }
    final lagnaRasiIndex = lagna['rasi_index'] as int;
    rasiMap[lagnaRasiIndex]!.add(lagna['abbreviation'] as String);
    return rasiMap;
  }

  String generateSouthIndianChart(Map<int, List<String>> rasiToPlanets) {
    final layout = [
      [11, 0, 1, 2],
      [10, -1, -1, 3],
      [9, -1, -1, 4],
      [8, 7, 6, 5],
    ];
    final buffer = StringBuffer();
    const boxWidth = 14;
    final hBorder = "+${'-' * boxWidth}";
    const vBorder = '|';
    buffer.writeln('${hBorder * 4}+');
    for (int row = 0; row < 4; row++) {
      buffer.write(vBorder);
      for (int col = 0; col < 4; col++) {
        final rasiIdx = layout[row][col];
        if (rasiIdx == -1) {
          buffer.write(' '.padRight(boxWidth));
        } else {
          buffer.write(_teluguRasiNames[rasiIdx].padRight(boxWidth));
        }
        buffer.write(vBorder);
      }
      buffer.writeln();
      buffer.write(vBorder);
      for (int col = 0; col < 4; col++) {
        final rasiIdx = layout[row][col];
        if (rasiIdx == -1) {
          buffer.write(' '.padRight(boxWidth));
        } else {
          final planetsStr = (rasiToPlanets[rasiIdx] ?? []).join(' ');
          buffer.write(planetsStr.padRight(boxWidth));
        }
        buffer.write(vBorder);
      }
      buffer.writeln();
      buffer.write(vBorder);
      for (int col = 0; col < 4; col++) {
        buffer.write(' '.padRight(boxWidth));
        buffer.write(vBorder);
      }
      buffer.writeln();
      buffer.writeln('${hBorder * 4}+');
    }
    return buffer.toString();
  }

  Future<Map<String, dynamic>> calculateRasiAndNakshatra(
    int year,
    int month,
    int day,
    double hourUTC,
    double lat,
    double lon,
  ) async {
    final fullChart = await calculateFullKundali(year, month, day, hourUTC, lat, lon);
    final moon = fullChart['planets']['Moon'] as Map<String, dynamic>;
    return {
      'julian_day': fullChart['julian_day'],
      'timestamp_utc': fullChart['timestamp_utc'],
      'location': fullChart['location'],
      'ayanamsa': fullChart['ayanamsa'],
      'ayanamsa_name': fullChart['ayanamsa_name'],
      'moon': {
        'sidereal_longitude': moon['sidereal_longitude'],
        'latitude': moon['latitude'],
        'distance_au': moon['distance_au'],
        'speed_longitude': moon['speed_longitude'],
        'degrees_in_rasi': moon['degrees_in_rasi'],
        'degrees_in_nakshatra': moon['degrees_in_nakshatra'],
        'pada': moon['pada'],
        'rasi': {
          'index': moon['rasi_index'],
          'name_telugu': moon['rasi_name_telugu'],
          'name_sanskrit': moon['rasi_name_sanskrit'],
        },
        'nakshatra': {
          'index': moon['nakshatra_index'],
          'name_telugu': moon['nakshatra_name_telugu'],
          'name_sanskrit': moon['nakshatra_name_sanskrit'],
          'lord': moon['nakshatra_lord'],
        },
      },
    };
  }

  double _normalizeLongitude(double lon) {
    lon = lon % 360.0;
    if (lon < 0) lon += 360.0;
    return lon;
  }

  int _getRasiIndex(double lon) => (lon / 30.0).floor() % 12;
  int _getNakshatraIndex(double lon) => (lon / 13.333333).floor() % 27;
  int _getPada(double lon) => ((lon / 3.333333).floor() % 4) + 1;
  double _getDegreesInSign(double lon) => lon % 30.0;
  double _getDegreesInNakshatra(double lon) => lon % 13.333333;

  String _formatTimestamp(int year, int month, int day, double hour) {
    final h = hour.floor();
    final min = ((hour - h) * 60).floor();
    final sec = (((hour - h) * 60) - min) * 60;
    return DateTime.utc(year, month, day, h, min, sec.floor(), (sec * 1000).floor() % 1000).toIso8601String();
  }

  static const List<String> _teluguRasiNames = [
    'Mesha', 'Vrishabha', 'Mithuna', 'Karkataka', 'Simha', 'Kanya',
    'Tula', 'Vrischika', 'Dhanassu', 'Makara', 'Kumbha', 'Meena',
  ];

  static const List<String> _sanskritRasiNames = [
    'Mesha', 'Vrishabha', 'Mithuna', 'Karkata', 'Simha', 'Kanya',
    'Tula', 'Vrischika', 'Dhanus', 'Makara', 'Kumbha', 'Meena',
  ];

  static const List<String> _teluguNakshatraNames = [
    'Aswini', 'Bharani', 'Krittika', 'Rohini', 'Mrigasira', 'Arudra', 'Punarvasu', 'Pushyami', 'Aslesha', 'Makha',
    'Pubba', 'Uttara', 'Hasta', 'Chitta', 'Swati', 'Visakha', 'Anuradha', 'Jyeshta', 'Moola', 'Poorvashada',
    'Uttarashada', 'Sravana', 'Dhanishta', 'Satabhisha', 'Poorvabhadra', 'Uttarabhadra', 'Revati',
  ];

  static const List<String> _sanskritNakshatraNames = [
    'Ashvini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
    'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula',
    'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
  ];

  static const List<String> _nakshatraLords = [
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu',
    'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus',
    'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
  ];
}