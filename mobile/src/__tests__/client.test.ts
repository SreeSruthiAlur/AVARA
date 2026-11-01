import { describe, it, expect } from '@jest/globals';
import { API_BASE_URL, getBaseUrl } from '../api/client';

describe('AVARA Mobile API Client Configuration', () => {
  it('should define a valid default API_BASE_URL with /api/v1 suffix', () => {
    expect(API_BASE_URL).toMatch(/http:\/\/(localhost|10\.0\.2\.2):8000\/api\/v1/);
  });

  it('getBaseUrl should resolve to a valid string URL', async () => {
    const url = await getBaseUrl();
    expect(typeof url).toBe('string');
    expect(url.length).toBeGreaterThan(0);
  });
});
