# AVARA — AI Personal Growth Mobile Application
## Teammate 2 Full Implementation & Shared Application Foundation

This repository contains the complete implementation for **Teammate 2** on the **AVARA** AI-powered personal growth mobile application. It has been built strictly from scratch without dataset dependencies, custom model training, or pre-trained binary weights.

---

## 1. Scope and Responsibilities

### Implemented by Teammate 2
1. **Multilingual Telugu NLP and Conversational Infrastructure**:
   - Telugu Unicode script detection (`\u0C00-\u0C7F`).
   - Tanglish phonetic marker identification.
   - English and Telugu-English mixed sentence handling.
   - Character repetition and whitespace normalization.
   - Intent classification engine for 11 distinct application intents.
   - Language-aware clarifying questions for ambiguous queries.
2. **Safety Classification and Response Validation Layer**:
   - Priority safety evaluations run **before** normal intent routing.
   - Self-harm and mental health crisis detection with immediate 24x7 helpline guidance (`Tele-MANAS: 14416`, `112`).
   - Medical emergency detection and non-clinical advisory disclaimers (`Ambulance: 108`).
   - Abuse and personal violence detection with emergency contacts (`181`, `1091`, `112`).
   - High-risk financial speculation protection.
   - Post-generation LLM response validation against medical cures and financial guarantees.
3. **Authentication, Security, and User Management**:
   - Registration, login, logout with secure `bcrypt` salted password hashing.
   - JWT session tokens (`HS256`, 7-day expiration).
   - Protected routes and authorization middleware enforcing strict user data isolation.
   - User profile viewing, updating, password updates, and account deletion.
   - Stored birth details (date, time, place) ready for Teammate 1 astrological integration.
4. **Shared Database & Backend Foundation**:
   - FastAPI application with versioned APIs (`/api/v1`).
   - SQLAlchemy ORM engine (SQLite for local dev, PostgreSQL-compatible architecture).
   - Alembic database migration system.
   - Centralized error handling and standardized JSON error structures.
5. **Shared LLM Service**:
   - Configurable LLM provider (`gemini`, `openai`, or `none`).
   - Backend-only API keys, timeouts, retries, and context window management.
   - Transparent fallback: explicitly informs users when live AI keys are unconfigured without fabricating mock responses.
6. **AVARA Finance**:
   - Add, edit, delete, and list expenses with filtering (category, date, search) and sorting.
   - Default categories: Food, Transportation, Shopping, Education, Entertainment, Healthcare, Bills, Other + custom categories.
   - Budget management: monthly budgets, category-level spending limits, utilization progress, and threshold warning alerts (>80%, >100%).
   - Finance dashboard: total spending, budget comparison, remaining balance, recent transactions.
   - **AI Finance Assistant**: answers queries deterministically against real user database records without hallucinations.
7. **AVARA Health and Wellness**:
   - Daily wellness check-ins: mood (1–5 scale with emojis), energy levels (1–5), sleep duration, physical activity minutes, personal goals, and mindfulness notes.
   - Health summary: streaks, average mood, average sleep, total activity minutes based strictly on actual database records.
8. **AVARA Astrologers**:
   - Directory with explicitly labelled demonstration profiles (`is_demo=True`).
   - Astrologer details, expertise, languages, experience, fees, and available time slots.
   - Consultation booking request creation, user bookings history, and cancellation.
9. **Teammate 1 Integration Contracts**:
   - Clean, replaceable adapter interfaces (`BaseAstrologyAdapter`, `BaseHabitsAdapter`, `BaseInsightsAdapter`) with documented schemas.
   - Direct integration endpoints (`/api/v1/integrations/...`) and in-app integration hub.
10. **React Native Mobile Frontend**:
    - Built using React Native, Expo SDK 58, TypeScript, and Expo Router.
    - Android and iOS compatibility.
    - Dark mode luxury palette (#0B0F17, #161D2A, #8B5CF6, #F59E0B, #10B981).
    - Loading states, empty states, error handling, and confirmation dialogs.

### Teammate 1 Responsibilities (NOT Implemented — Interfaces Provided)
- Astrological calculations and birth-chart ephemeris processing.
- Astrological interpretations and planetary evidence retrieval.
- AVARA Habits tracking and consistency algorithms.
- AVARA Insights synthesis and pattern identification.

---

## 2. Directory Structure

```text
End Sem Project/
├── backend/
│   ├── alembic/                    # Alembic migration scripts
│   │   ├── versions/               # Auto-generated migration files
│   │   └── env.py
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── api.py          # Master v1 API router
│   │   │       ├── auth.py         # Registration, login, logout
│   │   │       ├── profile.py      # Profile editing, password change, deletion
│   │   │       ├── chat.py         # Multilingual chat endpoints
│   │   │       ├── finance.py      # Expenses, budgets, dashboard, AI assistant
│   │   │       ├── health.py       # Wellness entries, check-ins, summaries
│   │   │       ├── astrologers.py  # Astrologer directory and bookings
│   │   │       └── integrations.py # Teammate 1 contract endpoints
│   │   ├── core/
│   │   │   ├── config.py           # App configuration and settings
│   │   │   ├── database.py         # SQLAlchemy engine and session dependency
│   │   │   ├── security.py         # Bcrypt hashing and JWT tokens
│   │   │   └── errors.py           # Centralized exception handlers
│   │   ├── middleware/
│   │   │   └── auth.py             # JWT bearer authentication dependency
│   │   ├── models/
│   │   │   ├── user.py             # User SQLAlchemy model
│   │   │   ├── chat.py             # Conversation & ChatMessage models
│   │   │   ├── finance.py          # Expense & Budget models
│   │   │   ├── health.py           # WellnessEntry model
│   │   │   └── astrologer.py       # Astrologer & ConsultationBooking models
│   │   ├── schemas/
│   │   │   ├── user.py             # Pydantic user request/response schemas
│   │   │   ├── chat.py             # Chat request/response schemas
│   │   │   ├── finance.py          # Finance & Budget schemas
│   │   │   ├── health.py           # Wellness schemas
│   │   │   ├── astrologer.py       # Astrologer & Booking schemas
│   │   │   └── integrations.py     # Teammate 1 contract schemas
│   │   ├── services/
│   │   │   ├── nlp/
│   │   │   │   ├── language_detector.py  # Unicode & heuristic language detection
│   │   │   │   ├── normalizer.py         # Lightweight character normalizer
│   │   │   │   ├── safety_guard.py       # Crisis, medical, abuse safety rules
│   │   │   │   └── intent_classifier.py  # Multilingual intent routing engine
│   │   │   ├── llm_service.py            # Reusable Gemini/OpenAI service
│   │   │   ├── chat_service.py           # Conversational orchestrator
│   │   │   ├── finance_service.py        # Deterministic calculations engine
│   │   │   └── teammate1_adapters.py     # Integration adapters for Teammate 1
│   │   └── main.py                 # FastAPI application entrypoint
│   ├── tests/
│   │   ├── conftest.py             # Test database fixtures and TestClient
│   │   ├── test_nlp.py             # Language detection & intent tests
│   │   ├── test_safety.py          # Crisis, medical, financial safety tests
│   │   ├── test_auth.py            # Registration, login, JWT tests
│   │   ├── test_finance.py         # Expenses, budgets, assistant tests
│   │   ├── test_health.py          # Wellness entry & summary tests
│   │   └── test_integrations.py    # Teammate 1 contracts & data isolation tests
│   ├── alembic.ini
│   ├── pytest.ini
│   └── requirements.txt
│
└── mobile/
    ├── src/
    │   ├── api/
    │   │   ├── client.ts           # Reusable fetch client with auth token
    │   │   └── services.ts         # Typed API service functions
    │   ├── context/
    │   │   └── AuthContext.tsx     # Authentication context & storage
    │   ├── theme/
    │   │   └── colors.ts           # Luxury dark color tokens
    │   ├── types/
    │   │   └── index.ts            # TypeScript interfaces
    │   ├── components/
    │   │   └── common.tsx          # ScreenHeader, Card, Button, Input, Badge, etc.
    │   ├── app/
    │   │   ├── (auth)/
    │   │   │   ├── login.tsx       # Sign In screen
    │   │   │   └── register.tsx    # Sign Up screen with language preference
    │   │   ├── (tabs)/
    │   │   │   ├── _layout.tsx     # 6-tab bottom navigation with vector icons
    │   │   │   ├── index.tsx       # Home Dashboard shell & snapshots
    │   │   │   ├── chat.tsx        # Multilingual Chatbot screen
    │   │   │   ├── finance.tsx     # Complete Finance dashboard & expenses
    │   │   │   ├── health.tsx      # Wellness dashboard & check-ins
    │   │   │   ├── astrologers.tsx # Astrologer directory & booking
    │   │   │   └── profile.tsx     # Profile, language toggle, and security
    │   │   ├── finance/
    │   │   │   ├── add-expense.tsx # Modal to log an expense
    │   │   │   └── budgets.tsx     # Modal to set monthly & category budgets
    │   │   ├── health/
    │   │   │   └── add-entry.tsx   # Modal for daily mood & energy check-in
    │   │   ├── teammate1/
    │   │   │   ├── astrology.tsx   # Astrology integration hub & contract test
    │   │   │   ├── habits.tsx      # Habits integration hub & contract test
    │   │   │   └── insights.tsx    # Insights integration hub & contract test
    │   │   ├── index.tsx           # Entry redirect handler
    │   │   └── _layout.tsx         # Root layout with AuthProvider & Stack routes
    │   └── __tests__/
    │       ├── client.test.ts      # Unit tests for API client
    │       ├── services.test.ts    # Unit tests for API service endpoints
    │       └── theme.test.ts       # Unit tests for theme colors
    ├── package.json
    ├── tsconfig.json
    └── jest.config.js
```

---

## 3. Database Structure

The database is built on SQLAlchemy and managed by Alembic migrations.

| Table Name | Description | Key Columns |
| :--- | :--- | :--- |
| `users` | User credentials, preferences, and birth details | `id`, `email`, `username`, `hashed_password`, `full_name`, `preferred_language` (`te`/`en`/`tanglish`), `response_preference`, `birth_date`, `birth_time`, `birth_place`, `is_active` |
| `conversations` | Grouping for chat threads | `id`, `user_id`, `title`, `created_at`, `updated_at` |
| `chat_messages` | Full conversational log with NLP tags | `id`, `conversation_id`, `user_id`, `sender` (`user`/`assistant`), `text`, `detected_language`, `language_confidence`, `intent`, `route_target`, `safety_status`, `clarification_needed` |
| `expenses` | Private financial transactions | `id`, `user_id`, `amount`, `category`, `date`, `description`, `payment_method`, `created_at` |
| `budgets` | Monthly budget limits and category allocations | `id`, `user_id`, `month` (`YYYY-MM`), `total_budget`, `category_limits` (JSON), `created_at` |
| `wellness_entries` | Daily physical and mental check-ins | `id`, `user_id`, `date`, `mood`, `mood_score` (1-5), `energy_level` (1-5), `sleep_hours`, `activity_minutes`, `wellness_goals`, `notes` |
| `astrologers` | Astrologer consultation directory | `id`, `name`, `title`, `bio`, `areas_of_expertise` (JSON), `languages` (JSON), `experience_years`, `consultation_fee`, `rating`, `is_demo`, `available_slots` (JSON) |
| `consultation_bookings` | Consultation requests and statuses | `id`, `user_id`, `astrologer_id`, `booking_date`, `time_slot`, `consultation_topic`, `status` (`requested`/`confirmed`/`cancelled`), `notes`, `is_demo` |

---

## 4. API Endpoints Reference

All endpoints are versioned under `/api/v1`.

### Authentication & Profile
- `POST /api/v1/auth/register` — Register new user account; returns JWT.
- `POST /api/v1/auth/login` — Login with email/username and password; returns JWT.
- `POST /api/v1/auth/logout` — Client token disposal confirmation.
- `GET /api/v1/profile/me` — Fetch authenticated user profile and settings.
- `PATCH /api/v1/profile/me` — Update full name, preferred language, or preferences.
- `POST /api/v1/profile/change-password` — Change password with current password verification.
- `DELETE /api/v1/profile/me` — Delete authenticated account and all data.

### Multilingual Chatbot & NLP
- `POST /api/v1/chat/message` — Dispatches message through Unicode language detector, normalizer, safety guard, intent classifier, module router, and response validator.
- `GET /api/v1/chat/conversations` — List user conversation threads.
- `GET /api/v1/chat/conversations/{id}` — Fetch conversation with full message history.
- `DELETE /api/v1/chat/conversations/{id}` — Delete conversation thread.

### AVARA Finance
- `POST /api/v1/finance/expenses` — Create an expense.
- `GET /api/v1/finance/expenses` — List expenses with search, category filtering, date range, and sorting.
- `GET /api/v1/finance/expenses/{id}` — Fetch single expense.
- `PUT /api/v1/finance/expenses/{id}` — Update an expense.
- `DELETE /api/v1/finance/expenses/{id}` — Delete an expense.
- `POST /api/v1/finance/budgets` — Set or update monthly budget and category limits.
- `GET /api/v1/finance/budgets/{month}` — Fetch budget for month (`YYYY-MM`).
- `GET /api/v1/finance/dashboard` — Get deterministic dashboard summary (total spent, budget, utilization, threshold alert, breakdown).
- `POST /api/v1/finance/ai-assistant` — Query AI assistant on user's real recorded expense data deterministically.

### AVARA Health & Wellness
- `POST /api/v1/health/entries` — Record daily mood, energy, sleep, activity, and goals.
- `GET /api/v1/health/entries` — Retrieve wellness history with date filtering.
- `GET /api/v1/health/entries/{id}` — Fetch single wellness entry.
- `PUT /api/v1/health/entries/{id}` — Update wellness entry.
- `DELETE /api/v1/health/entries/{id}` — Delete wellness entry.
- `GET /api/v1/health/summary` — Get average mood, energy, sleep, activity, and streaks.

### Astrologers Directory & Bookings
- `GET /api/v1/astrologers` — List astrologers with filters (language, expertise). Demonstrations clearly marked.
- `GET /api/v1/astrologers/{id}` — Get astrologer details and available slots.
- `POST /api/v1/astrologers/bookings` — Submit consultation booking request.
- `GET /api/v1/astrologers/bookings/me` — View all consultation bookings for authenticated user.
- `DELETE /api/v1/astrologers/bookings/{id}` — Cancel consultation booking.

### Teammate 1 Integration Contracts
- `GET /api/v1/integrations/contracts` — Specifications and instructions for Teammate 1.
- `POST /api/v1/integrations/astrology/chart` — Astrology adapter endpoint.
- `GET /api/v1/integrations/habits/summary` — Habits adapter endpoint.
- `GET /api/v1/integrations/insights/summary` — Insights adapter endpoint.

---

## 5. Startup and Execution Instructions

### Prerequisites
- Python 3.10+ (tested with Python 3.11.9)
- Node.js 18+ (tested with Node.js v22.14.0, npm 10.9.2)

### 1. Starting the FastAPI Backend
```bash
# Navigate to backend directory
cd "End Sem Project/backend"

# Install backend dependencies
python -m pip install -r requirements.txt

# Run database migrations
python -m alembic upgrade head

# Start FastAPI server on port 8000
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The interactive Swagger API documentation will be available at:
`http://localhost:8000/docs`

Health check endpoint:
`http://localhost:8000/health`

### 2. Starting the React Native Mobile Application
```bash
# Navigate to mobile directory
cd "End Sem Project/mobile"

# Start the Expo development server
npm start
```

### 3. Android Testing Instructions
- **Android Emulator**:
  - Open Android Studio and start an Android Virtual Device (AVD).
  - In the terminal running Expo (`npm start`), press `a` to launch the Android build on the emulator.
  - The mobile API client automatically connects to the backend at `http://10.0.2.2:8000/api/v1`.
- **Physical Android Phone**:
  - Install the **Expo Go** app from the Google Play Store.
  - Connect your phone to the same Wi-Fi network as your computer.
  - In `npm start`, scan the QR code displayed in the terminal with the Expo Go app.

---

## 6. Tests Executed and Actual Results

All tests were authored without external datasets and verified through command execution:

### 1. Backend Pytest Suite
Ran command: `python -m pytest -v`
Result: **27 passed in 6.08s (100% pass rate)**

```text
tests/test_auth.py::test_user_registration_and_login PASSED              [  3%]
tests/test_auth.py::test_unauthorized_access PASSED                      [  7%]
tests/test_finance.py::test_finance_expenses_and_budgets PASSED          [ 11%]
tests/test_health.py::test_health_wellness_entries_and_summary PASSED    [ 14%]
tests/test_integrations.py::test_chat_routing_and_llm_fallback PASSED    [ 18%]
tests/test_integrations.py::test_astrologer_directory_and_booking PASSED [ 22%]
tests/test_integrations.py::test_user_data_isolation PASSED              [ 25%]
tests/test_nlp.py::test_language_detection_telugu_script PASSED          [ 29%]
tests/test_nlp.py::test_language_detection_english PASSED                [ 33%]
tests/test_nlp.py::test_language_detection_tanglish PASSED               [ 37%]
tests/test_nlp.py::test_language_detection_mixed PASSED                  [ 40%]
tests/test_nlp.py::test_normalizer_repeated_chars_and_whitespace PASSED  [ 44%]
tests/test_nlp.py::test_intent_classification_finance PASSED             [ 48%]
tests/test_nlp.py::test_intent_classification_health PASSED              [ 51%]
tests/test_nlp.py::test_intent_classification_teammate1_astrology PASSED [ 55%]
tests/test_nlp.py::test_intent_classification_teammate1_habits PASSED    [ 59%]
tests/test_nlp.py::test_intent_classification_teammate1_insights PASSED  [ 62%]
tests/test_nlp.py::test_intent_classification_astrologers_discovery PASSED [ 66%]
tests/test_nlp.py::test_intent_ambiguous_clarification PASSED            [ 70%]
tests/test_safety.py::test_safety_mental_health_crisis_english PASSED    [ 74%]
tests/test_safety.py::test_safety_mental_health_crisis_telugu PASSED     [ 77%]
tests/test_safety.py::test_safety_mental_health_crisis_tanglish PASSED   [ 81%]
tests/test_safety.py::test_safety_medical_emergency_english PASSED       [ 85%]
tests/test_safety.py::test_safety_abuse_report PASSED                    [ 88%]
tests/test_safety.py::test_safety_financial_fraud_guarantee PASSED       [ 92%]
tests/test_safety.py::test_safety_intercepts_before_intent_routing PASSED [ 96%]
tests/test_safety.py::test_llm_response_validation PASSED                [100%]
======================== 27 passed, 1 warning in 6.08s ========================
```

### 2. Mobile TypeScript Compilation
Ran command: `npx tsc --noEmit`
Result: **0 errors, clean compilation**

### 3. Mobile Jest Test Suite
Ran command: `npm test`
Result: **3 passed test suites, 10 passed tests (100% pass rate)**

```text
PASS src/__tests__/services.test.ts
PASS src/__tests__/theme.test.ts
PASS src/__tests__/client.test.ts

Test Suites: 3 passed, 3 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        1.685 s
```

---

## 7. External API Configuration Required

Live LLM functionality is **completely optional**. If no API keys are supplied, the application:
1. Starts without error.
2. Transparently displays a notice that live AI is unconfigured.
3. Automatically executes verified rule-based language detection, intent routing, and deterministic financial calculations.
4. Never hallucinates or pretends mock responses are real AI.

To enable live generative AI responses, set in `backend/.env` or system environment:
```env
LLM_PROVIDER=gemini        # or "openai"
LLM_API_KEY=your_api_key_here
LLM_MODEL=gemini-1.5-flash # or "gpt-4o-mini"
```

---

## 8. Instructions for Teammate 1 Integration

Teammate 1 can easily plug their modules into the existing architecture:

1. **Astrology Intelligence**:
   - Open `backend/app/services/teammate1_adapters.py`.
   - Subclass `BaseAstrologyAdapter` and implement:
     ```python
     async def get_chart_and_interpretation(self, request: AstrologyBirthChartRequest) -> AstrologyResponse:
         # Compute planetary positions from request.birth_date, request.birth_time, request.birth_place
         # Return AstrologyResponse with sun_sign, moon_sign, interpretation_summary, and evidence_notes
     ```
   - In `teammate1_adapters.py`, point `astrology_adapter = ConcreteAstrologyAdapter()`.
2. **AVARA Habits**:
   - Subclass `BaseHabitsAdapter` and implement `get_user_habits_summary(user_id)`.
   - In `teammate1_adapters.py`, point `habits_adapter = ConcreteHabitsAdapter()`.
3. **AVARA Insights**:
   - Subclass `BaseInsightsAdapter` and implement `get_user_insights(user_id)`.
   - In `teammate1_adapters.py`, point `insights_adapter = ConcreteInsightsAdapter()`.
4. **Automatic Benefits for Teammate 1**:
   - Teammate 1 does not need to re-implement user login, JWT tokens, Telugu script detection, Tanglish heuristics, safety emergency interception, database connections, or mobile navigation shells.
   - All astrology, habit, and insight queries sent via the chat interface (`/api/v1/chat/message`) or the mobile UI are already automatically routed to these adapter hooks.
