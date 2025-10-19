/**
 * @jest-environment node
 */
import { GET } from '@/app/api/posts/route';
import { NextRequest } from 'next/server';
import { getDbConnection } from '@/lib/db/data-source';

jest.mock('@/lib/db/data-source');

const mockedGetDbConnection = getDbConnection as jest.Mock;

describe('GET /api/posts', () => {
  const mockFindAndCount = jest.fn();

  it('デフォルトのパラメータで記事一覧を取得できること', async () => {
    mockFindAndCount.mockClear();
    const mockPosts = [{ slug: 'test-post', title: 'Test Post', categories: [] }];
    mockFindAndCount.mockResolvedValueOnce([mockPosts, 1]);
    mockedGetDbConnection.mockResolvedValueOnce({
      getRepository: () => ({ findAndCount: mockFindAndCount }),
    });

    const req = new NextRequest('http://localhost/api/posts');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.posts).toEqual(mockPosts);
    expect(data.pagination.total).toBe(1);
  });

  it('カテゴリのパラメータが正しく適用されること', async () => {
    mockFindAndCount.mockClear();
    mockFindAndCount.mockResolvedValueOnce([[], 0]);
    mockedGetDbConnection.mockResolvedValueOnce({
      getRepository: () => ({ findAndCount: mockFindAndCount }),
    });

    const req = new NextRequest('http://localhost/api/posts?category=test-cat');
    await GET(req);

    expect(mockFindAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'published', categories: { name: 'test-cat' } },
      })
    );
  });

  it('年月のパラメータが正しく適用されること', async () => {
    mockFindAndCount.mockClear();
    mockFindAndCount.mockResolvedValueOnce([[], 0]);
    mockedGetDbConnection.mockResolvedValueOnce({
      getRepository: () => ({ findAndCount: mockFindAndCount }),
    });

    const req = new NextRequest('http://localhost/api/posts?year=2025&month=10');
    await GET(req);

    const whereClause = mockFindAndCount.mock.calls[0][0].where;
    expect(whereClause.publishedAt).toBeDefined();
  });
});