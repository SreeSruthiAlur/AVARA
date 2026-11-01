import { apiRequest } from './client';
import {
  User,
  AuthResponse,
  ChatMessage,
  Conversation,
  Expense,
  FinanceDashboard,
  Budget,
  WellnessEntry,
  HealthSummary,
  Astrologer,
  Booking
} from '../types';

export const authService = {
  register: (payload: any) => apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: any) => apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getProfile: () => apiRequest<User>('/profile/me'),
  updateProfile: (payload: any) => apiRequest<User>('/profile/me', { method: 'PATCH', body: JSON.stringify(payload) }),
  changePassword: (payload: any) => apiRequest('/profile/change-password', { method: 'POST', body: JSON.stringify(payload) }),
  deleteAccount: () => apiRequest('/profile/me', { method: 'DELETE' }),
};

export const chatService = {
  sendMessage: (message: string, conversation_id?: number) =>
    apiRequest<{
      success: boolean;
      conversation_id: number;
      user_message: ChatMessage;
      assistant_message: ChatMessage;
      intent: string;
      detected_language: string;
      route_target: string;
      safety_status: string;
    }>('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message, conversation_id }),
    }),
  listConversations: () => apiRequest<Conversation[]>('/chat/conversations'),
  getConversation: (id: number) => apiRequest<{ id: number; title: string; messages: ChatMessage[] }>(`/chat/conversations/${id}`),
  deleteConversation: (id: number) => apiRequest(`/chat/conversations/${id}`, { method: 'DELETE' }),
};

export const financeService = {
  getDashboard: (month?: string) => apiRequest<FinanceDashboard>(`/finance/dashboard${month ? `?month=${month}` : ''}`),
  getExpenses: (params?: Record<string, string>) => {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return apiRequest<Expense[]>(`/finance/expenses${qs ? `?${qs}` : ''}`);
  },
  createExpense: (payload: any) => apiRequest<Expense>('/finance/expenses', { method: 'POST', body: JSON.stringify(payload) }),
  updateExpense: (id: number, payload: any) => apiRequest<Expense>(`/finance/expenses/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteExpense: (id: number) => apiRequest(`/finance/expenses/${id}`, { method: 'DELETE' }),
  getBudget: (month: string) => apiRequest<Budget>(`/finance/budgets/${month}`),
  setBudget: (payload: any) => apiRequest<Budget>('/finance/budgets', { method: 'POST', body: JSON.stringify(payload) }),
  queryAssistant: (query: string) => apiRequest<any>('/finance/ai-assistant', { method: 'POST', body: JSON.stringify({ query }) }),
};

export const healthService = {
  getSummary: () => apiRequest<HealthSummary>('/health/summary'),
  getEntries: (params?: Record<string, string>) => {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return apiRequest<WellnessEntry[]>(`/health/entries${qs ? `?${qs}` : ''}`);
  },
  createEntry: (payload: any) => apiRequest<WellnessEntry>('/health/entries', { method: 'POST', body: JSON.stringify(payload) }),
  updateEntry: (id: number, payload: any) => apiRequest<WellnessEntry>(`/health/entries/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteEntry: (id: number) => apiRequest(`/health/entries/${id}`, { method: 'DELETE' }),
};

export const astrologerService = {
  listAstrologers: (params?: Record<string, string>) => {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return apiRequest<Astrologer[]>(`/astrologers${qs ? `?${qs}` : ''}`);
  },
  getAstrologer: (id: number) => apiRequest<Astrologer>(`/astrologers/${id}`),
  bookConsultation: (payload: any) => apiRequest<Booking>('/astrologers/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  getMyBookings: () => apiRequest<Booking[]>('/astrologers/bookings/me'),
  cancelBooking: (id: number) => apiRequest(`/astrologers/bookings/${id}`, { method: 'DELETE' }),
};

export const integrationsService = {
  getContracts: () => apiRequest<any>('/integrations/contracts'),
  getAstrologyChart: (payload: any) => apiRequest<any>('/integrations/astrology/chart', { method: 'POST', body: JSON.stringify(payload) }),
  getHabitsSummary: () => apiRequest<any>('/integrations/habits/summary'),
  getInsightsSummary: () => apiRequest<any>('/integrations/insights/summary'),
};
