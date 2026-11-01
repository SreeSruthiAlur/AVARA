# AVARA — AI Personal Growth & Astrology Application

> **Project Architecture & Modules Overview:**
> - **Teammate 1 (Astrology & Birth Chart Engine)**: Flutter Vedic Kundali calculation app documented below.
> - **Teammate 2 (Vinya — Shared Core & Application Modules)**: Multilingual Telugu/Tanglish/English NLP, Priority Safety Layer, JWT Authentication, FastAPI Backend, AVARA Finance, AVARA Health, Astrologer Consultations, and React Native Expo Mobile App. See [README_TEAMMATE2.md](README_TEAMMATE2.md) for full documentation, API reference, test results, and startup instructions.

---

## Teammate 1: Astrology & Birth Profile Evidence (Flutter)

A Flutter app that calculates a Vedic **Janma Kundali** (birth chart) using the
Swiss Ephemeris (`sweph`), then displays the user's **Telugu Rasi** and
**Nakshatra** alongside a visual **4×4 South Indian chart**.

The astrology math is handled by a backend engine (`TeluguKundaliCalculator`),
and the UI is the **Birth Profile & Astrology Evidence** screen that collects
birth details, geocodes the place of birth, runs the calculation, and renders
the results.

---

## Features

- **Birth details form**: Date of Birth, Time of Birth (local), Timezone Offset
  (defaults to IST +5:30), Place of Birth (City/State), and Ayanamsa
  (Lahiri / Raman / KP).
- **Generate Evidence Chart** button that:
  1. Geocodes the place via Nominatim (OpenStreetMap).
  2. Converts local time of birth to UTC (handles day rollover).
  3. Runs `TeluguKundaliCalculator.calculateFullKundali(...)`.
- **Results section** showing the Telugu Rasi, Nakshatra (with Sanskrit),
  Pada, Nakshatra Lord, Lagna, coordinates, UTC timestamp, and resolved place.
- **4×4 South Indian chart** (GridView) with the center 2×2 left empty and
  planets placed in their correct Rasi boxes. The Moon Rasi box is highlighted
  with a blue border and Lagna with a navy border.
- **Raw Evidence** expandable section showing the full JSON payload returned
  by the engine.

## Brand styling

| Token            | Color     | Usage                          |
| ---------------- | -------- | ------------------------------ |
| Background       | #F9FBFC  | Scaffold / page background      |
| Deep Navy        | #100960  | App bar, primary text          |
| Blue             | #2E71DB  | Buttons, interactive accents   |
| Light Blue        | #E5F2FE  | Card / chart-box surfaces      |
| Border           | #DCE5F2  | Card / chart-box borders       |

---

## Project structure

```
lib/
├── main.dart                         # Flutter entry point (MaterialApp + AVARA theme)
├── avara_colors.dart                 # Shared AVARA brand color palette
├── screens/
│   └── birth_profile_screen.dart     # The Birth Profile & Astrology Evidence screen
├── telugu_kundali.dart               # Backend math engine (TeluguKundaliCalculator)
└── chart_calculator.dart             # Older tropical chart helper (not used by the UI)
bin/
└── main.dart                         # Legacy interactive CLI (superseded by the Flutter UI)
```

## Backend engine

`lib/telugu_kundali.dart` exposes `TeluguKundaliCalculator`, which uses `sweph`
to compute sidereal planetary positions and returns a `Map<String, dynamic>`
containing:

- `planets` — Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu
  (each with `rasi_index`, `rasi_name_telugu`, `nakshatra_name_telugu`,
  `pada`, `nakshatra_lord`, `is_retrograde`, etc.).
- `lagna` — the ascendant.
- `rasi_to_planets` — `Map<int, List<String>>` grouping planet abbreviations
  per Rasi (used to place planets in the chart grid).
- `south_indian_chart` — an ASCII text rendering of the chart.
- `ayanamsa`, `julian_day`, `timestamp_utc`, `location`.

The calculator accepts optional `epheAssets`, `assetLoader`, and
`epheFilesPath` params so the bundled ephemeris files load on Flutter. These
default to empty/null, so the legacy CLI behavior is unchanged.

---

## Prerequisites

- Flutter 3.47+ (Dart 3.13+).
- **Windows only**: enable **Developer Mode** so Flutter can create the
  symlinks required by the native `sweph` plugin
  (`start ms-settings:developers`).
- Internet access (needed for Nominatim geocoding).

## Install dependencies

```bash
flutter pub get
```

## Run

```bash
# Windows desktop (recommended for local testing)
flutter run -d windows

# Android (device/emulator)
flutter run -d android

# Web
flutter run -d chrome
```

List available targets:

```bash
flutter devices
```

> **Note (Android):** `epheFilesPath: 'ephe_files'` is relative to the working
> directory, which is fine on desktop. On Android it may need an absolute
> writable path via `path_provider` (e.g. `getApplicationDocumentsDirectory()`).

## Analyze

```bash
flutter analyze
```

The UI code (`main.dart`, `avara_colors.dart`, `screens/birth_profile_screen.dart`,
and `telugu_kundali.dart`) analyzes cleanly. Pre-existing lint hints remain in
the untouched legacy files (`bin/main.dart`, `lib/chart_calculator.dart`).

---

## Dependencies

- [`sweph`](https://pub.dev/packages/sweph) — Swiss Ephemeris bindings (native
  FFI plugin; bundles ephemeris files for Flutter).
- [`http`](https://pub.dev/packages/http) — geocoding requests.
- [`path`](https://pub.dev/packages/path) — path utilities.
