import 'package:avara_astrology_trial/avara_colors.dart';
import 'package:avara_astrology_trial/screens/astrology_chat_screen.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(const AvaraApp());
}

class AvaraApp extends StatelessWidget {
  const AvaraApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AVARA Astrology',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: AvaraColors.background,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AvaraColors.blue,
          primary: AvaraColors.navy,
          secondary: AvaraColors.blue,
          surface: Colors.white,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: AvaraColors.navy,
          foregroundColor: Colors.white,
          centerTitle: false,
          elevation: 0,
        ),
        inputDecorationTheme: const InputDecorationTheme(
          border: OutlineInputBorder(),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AvaraColors.blue,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.all(Radius.circular(8)),
            ),
          ),
        ),
      ),
      home: AstrologyChatScreen(
        // Inject your key: flutter run --dart-define=GEMINI_API_KEY=<your_key>
        apiKey: const String.fromEnvironment(
          'GEMINI_API_KEY',
          defaultValue: '',
        ),
      ),
    );
  }
}
