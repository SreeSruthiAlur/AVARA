import { describe, it, expect } from '@jest/globals';
import { Colors } from '../theme/colors';

describe('AVARA Mobile Theme System', () => {
  it('should define core luxury dark theme color tokens', () => {
    expect(Colors.background).toBe('#0B0F17');
    expect(Colors.card).toBe('#161D2A');
    expect(Colors.primary).toBe('#8B5CF6'); // Celestial Violet
    expect(Colors.secondary).toBe('#F59E0B'); // Gold/Amber
    expect(Colors.accent).toBe('#10B981'); // Emerald
    expect(Colors.danger).toBe('#EF4444'); // Red alert
  });

  it('should define distinct multilingual language tag badges', () => {
    expect(Colors.tagTelugu).toBeDefined();
    expect(Colors.tagEnglish).toBeDefined();
    expect(Colors.tagTanglish).toBeDefined();
    expect(Colors.tagMixed).toBeDefined();
  });
});
