import { describe, it, expect } from '@jest/globals';
import {
  authService,
  chatService,
  financeService,
  healthService,
  astrologerService,
  integrationsService,
} from '../api/services';

describe('AVARA Mobile API Services Definitions', () => {
  it('should have all required Auth service methods', () => {
    expect(typeof authService.register).toBe('function');
    expect(typeof authService.login).toBe('function');
    expect(typeof authService.logout).toBe('function');
    expect(typeof authService.getProfile).toBe('function');
    expect(typeof authService.updateProfile).toBe('function');
    expect(typeof authService.changePassword).toBe('function');
    expect(typeof authService.deleteAccount).toBe('function');
  });

  it('should have Chat service methods for conversations and message dispatch', () => {
    expect(typeof chatService.sendMessage).toBe('function');
    expect(typeof chatService.listConversations).toBe('function');
    expect(typeof chatService.getConversation).toBe('function');
    expect(typeof chatService.deleteConversation).toBe('function');
  });

  it('should have Finance service methods for expenses, budgets, dashboard, and AI assistant', () => {
    expect(typeof financeService.getDashboard).toBe('function');
    expect(typeof financeService.getExpenses).toBe('function');
    expect(typeof financeService.createExpense).toBe('function');
    expect(typeof financeService.updateExpense).toBe('function');
    expect(typeof financeService.deleteExpense).toBe('function');
    expect(typeof financeService.getBudget).toBe('function');
    expect(typeof financeService.setBudget).toBe('function');
    expect(typeof financeService.queryAssistant).toBe('function');
  });

  it('should have Health service methods for wellness check-ins, summaries, and entries', () => {
    expect(typeof healthService.getSummary).toBe('function');
    expect(typeof healthService.getEntries).toBe('function');
    expect(typeof healthService.createEntry).toBe('function');
    expect(typeof healthService.updateEntry).toBe('function');
    expect(typeof healthService.deleteEntry).toBe('function');
  });

  it('should have Astrologer service methods for discovery and consultation booking', () => {
    expect(typeof astrologerService.listAstrologers).toBe('function');
    expect(typeof astrologerService.getAstrologer).toBe('function');
    expect(typeof astrologerService.bookConsultation).toBe('function');
    expect(typeof astrologerService.getMyBookings).toBe('function');
    expect(typeof astrologerService.cancelBooking).toBe('function');
  });

  it('should have Teammate 1 Integration contracts service methods', () => {
    expect(typeof integrationsService.getContracts).toBe('function');
    expect(typeof integrationsService.getAstrologyChart).toBe('function');
    expect(typeof integrationsService.getHabitsSummary).toBe('function');
    expect(typeof integrationsService.getInsightsSummary).toBe('function');
  });
});
