/**
 * @jest-environment node
 */

import { createRequest } from 'node-mocks-http';
import { NextRequest } from 'next/server';

// モックのセットアップ
const mockFindAndCount = jest.fn();
const mockGetRepository = jest.fn(() => ({
  findAndCount: mockFindAndCount,
}));

jest.doMock('@/lib/db/data-source', () => ({
  AppDataSource: {
    isInitialized: true,
    getRepository: mockGetRepository,
    initialize: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.doMock('typeorm', () => {
  const original = jest.requireActual('typeorm');
  return {
    ...original,
    Between: jest.fn((start, end) => `BETWEEN ${start.toISOString()} AND ${end.toISOString()}`),
  };
});

beforeEach(() => {
  jest.resetModules();
  mockFindAndCount.mockClear();
  mockGetRepository.mockClear();
});

describe('GET /api/posts', () => {
  const createMockRequest = (url: string) => {
    const req = createRequest({
      method: 'GET',
      url,
    });
    return {
      ...req,
      nextUrl: {
        searchParams: new URL(url, 'http://localhost').searchParams,
      },
    } as unknown as NextRequest;
  };

  it('デフォルトのパラメータで記事一覧を取得できること', async () => {
    const { GET } = await import('@/app/api/posts/route');
    const mockPosts = [
      { id: 1, slug: 'post-1', title: 'Post 1', publishedAt: new Date(), categories: [{ id: 1, name: 'cat1' }] },
    ];
    mockFindAndCount.mockResolvedValue([mockPosts, 1]);

    const req = createMockRequest('/api/posts');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.posts).toHaveLength(1);
  });

  it('カテゴリのパラメータが正しく適用されること', async () => {
    const { GET } = await import('@/app/api/posts/route');
    mockFindAndCount.mockResolvedValue([[], 0]);

    const req = createMockRequest('/api/posts?category=test-cat');
    await GET(req);

    expect(mockFindAndCount).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: 'published', categories: { name: 'test-cat' } },
    }));
  });

  it('年月のパラメータが正しく適用されること', async () => {
    const { GET } = await import('@/app/api/posts/route');
    mockFindAndCount.mockResolvedValue([[], 0]);

    const req = createMockRequest('/api/posts?year=2025&month=10');
    await GET(req);

    const whereClause = mockFindAndCount.mock.calls[0][0].where;
    expect(whereClause.publishedAt).toBeDefined();
  });
});