/**
 * @jest-environment node
 */

import { createRequest } from 'node-mocks-http';
import { NextRequest } from 'next/server';

// モックのセットアップ
const mockFindOne = jest.fn();
const mockGetRepository = jest.fn(() => ({
  findOne: mockFindOne,
}));

jest.doMock('@/lib/db/data-source', () => ({
  AppDataSource: {
    isInitialized: true,
    getRepository: mockGetRepository,
    initialize: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockReadFile = jest.fn();
const originalFs = jest.requireActual('fs');
jest.doMock('fs', () => ({
  __esModule: true,
  ...originalFs,
  promises: {
    ...originalFs.promises,
    readFile: mockReadFile,
  },
}));

beforeEach(() => {
  jest.resetModules();
  mockFindOne.mockClear();
  mockGetRepository.mockClear();
  mockReadFile.mockClear();
});

describe('GET /api/posts/:slug', () => {
  const createMockRequest = (slug: string) => {
    const req = createRequest({
      method: 'GET',
      url: `/api/posts/${slug}`,
    });
    return req as unknown as NextRequest;
  };

  it('指定されたslugの記事が取得できること', async () => {
    const { GET } = await import('@/app/api/posts/[slug]/route');
    const mockPost = {
      id: 1,
      slug: 'test-post',
      title: 'Test Post',
      filePath: '../../data/posts/test-post.md',
      publishedAt: new Date(),
      author: { name: 'Test Author' },
      categories: [{ id: 1, name: 'cat1' }],
    };
    const mockContent = '# Test Content';

    mockFindOne.mockResolvedValue(mockPost);
    mockReadFile.mockResolvedValue(mockContent);

    const req = createMockRequest('test-post');
    const response = await GET(req, { params: { slug: 'test-post' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.slug).toBe('test-post');
    expect(data.title).toBe('Test Post');
    expect(data.content).toBe(mockContent);
    expect(data.author.name).toBe('Test Author');
  });

  it('記事が見つからない場合に404を返すこと', async () => {
    const { GET } = await import('@/app/api/posts/[slug]/route');
    mockFindOne.mockResolvedValue(null);

    const req = createMockRequest('not-found-post');
    const response = await GET(req, { params: { slug: 'not-found-post' } });

    expect(response.status).toBe(404);
  });

  it('Markdownファイルが見つからない場合に404を返すこと', async () => {
    const { GET } = await import('@/app/api/posts/[slug]/route');
    const mockPost = { id: 1, slug: 'test-post', filePath: 'non-existent-file.md' };
    mockFindOne.mockResolvedValue(mockPost);

    const fileNotFoundError: Error & { code?: string } = new Error('File not found');
    fileNotFoundError.code = 'ENOENT';
    mockReadFile.mockRejectedValue(fileNotFoundError);

    const req = createMockRequest('test-post');
    const response = await GET(req, { params: { slug: 'test-post' } });

    expect(response.status).toBe(404);
  });
});
