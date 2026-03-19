/**
 * Tests - /api/profile/history route
 * Validates query param parsing, auth check, and response shape.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before imports
vi.mock('@/lib/auth/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/stats/storage', () => ({
  getSessionHistory: vi.fn(),
}));

// Must use dynamic import after mocks
const { getSession } = await import('@/lib/auth/session');
const { getSessionHistory } = await import('@/lib/stats/storage');

// Helper to create NextRequest-like objects
function createRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/profile/history');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return {
    url: url.toString(),
  } as unknown as import('next/server').NextRequest;
}

// Mock cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'test-token' }),
  }),
}));

describe('/api/profile/history', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when session is invalid', async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const { GET } = await import('@/app/api/profile/history/route');
    const request = createRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBeDefined();
  });

  it('returns session history with default filters', async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: 'user-1',
      token: 'test-token',
      username: 'testuser',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    });
    vi.mocked(getSessionHistory).mockResolvedValue({
      sessions: [],
      total: 0,
      hasMore: false,
    });

    const { GET } = await import('@/app/api/profile/history/route');
    const request = createRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.history).toBeDefined();
    expect(getSessionHistory).toHaveBeenCalledWith('user-1', {
      mode: undefined,
      startDate: undefined,
      endDate: undefined,
      limit: 20,
      offset: 0,
    });
  });

  it('passes query filters to storage', async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: 'user-1',
      token: 'test-token',
      username: 'testuser',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    });
    vi.mocked(getSessionHistory).mockResolvedValue({
      sessions: [],
      total: 0,
      hasMore: false,
    });

    const { GET } = await import('@/app/api/profile/history/route');
    const request = createRequest({
      mode: 'practice',
      limit: '10',
      offset: '5',
    });
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(getSessionHistory).toHaveBeenCalledWith('user-1', {
      mode: 'practice',
      startDate: undefined,
      endDate: undefined,
      limit: 10,
      offset: 5,
    });
  });

  it('clamps limit to max 100', async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: 'user-1',
      token: 'test-token',
      username: 'testuser',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    });
    vi.mocked(getSessionHistory).mockResolvedValue({
      sessions: [],
      total: 0,
      hasMore: false,
    });

    const { GET } = await import('@/app/api/profile/history/route');
    const request = createRequest({ limit: '999' });
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(getSessionHistory).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ limit: 100 })
    );
  });
});
