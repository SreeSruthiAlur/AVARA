export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  preferred_language: 'te' | 'en' | 'tanglish';
  response_preference: string;
  birth_date?: string;
  birth_time?: string;
  birth_place?: string;
  share_wellness_data: boolean;
  email_notifications: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in_seconds: number;
  user_id: number;
  email: string;
  username: string;
  preferred_language: string;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  detected_language?: 'telugu' | 'english' | 'tanglish' | 'mixed';
  language_confidence?: number;
  intent?: string;
  route_target?: string;
  safety_status: 'safe' | 'advisory' | 'crisis';
  clarification_needed: boolean;
  created_at: string;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: number;
  user_id: number;
  amount: number;
  category: string;
  date: string;
  description?: string;
  payment_method: string;
  created_at: string;
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  budget_limit?: number;
  is_over_budget: boolean;
}

export interface FinanceDashboard {
  current_month: string;
  total_spending_month: number;
  total_budget_month?: number;
  remaining_budget_month?: number;
  budget_utilization_pct?: number;
  threshold_alert?: string;
  category_breakdown: CategorySpending[];
  recent_transactions: Expense[];
  total_transactions_count: number;
}

export interface Budget {
  id: number;
  user_id: number;
  month: string;
  total_budget: number;
  category_limits: Record<string, number>;
  created_at: string;
}

export interface WellnessEntry {
  id: number;
  user_id: number;
  date: string;
  mood: string;
  mood_score: number;
  energy_level: number;
  sleep_hours?: number;
  activity_minutes?: number;
  wellness_goals?: string;
  notes?: string;
  created_at: string;
}

export interface HealthSummary {
  total_entries: number;
  average_mood_score?: number;
  average_energy_level?: number;
  average_sleep_hours?: number;
  total_activity_minutes: number;
  recent_entries: WellnessEntry[];
  wellness_streak_days: number;
}

export interface Astrologer {
  id: number;
  name: string;
  title: string;
  bio: string;
  areas_of_expertise: string[];
  languages: string[];
  experience_years: number;
  consultation_fee: number;
  rating: number;
  is_demo: boolean;
  available_slots: string[];
}

export interface Booking {
  id: number;
  user_id: number;
  astrologer_id: number;
  astrologer_name?: string;
  booking_date: string;
  time_slot: string;
  consultation_topic: string;
  status: 'requested' | 'confirmed' | 'cancelled';
  notes?: string;
  is_demo: boolean;
  created_at: string;
}
