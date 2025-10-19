/**
 * @jest-environment node
 */
import { GET } from '@/app/api/posts/[slug]/route';
import { NextRequest } from 'next/server';
import { getDbConnection } from '@/lib/db/data-source';
import fs from 'fs/promises';
import path from 'path';

jest.mock('@/lib/db/data-source');

const mockedGetDbConnection = getDbConnection as jest.Mock;

describe('GET /api/posts/:slug', () => {
  const mockFindOne = jest.fn();
  const testDir = path.join(process.cwd(), 'data', 'posts', '2025', '10');
  const testFile = path.join(testDir, 'test-post.md');

  beforeAll(async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(testFile, '---\ntitle: Test Post\n---\nHello World');
  });

  afterAll(async () => {
    await fs.unlink(testFile);
    await fs.rm(testDir, { recursive: true });
  });

  beforeEach(() => {
    mockFindOne.mockClear();
    mockedGetDbConnection.mockClear();

    mockedGetDbConnection.mockResolvedValue({
      getRepository: () => ({
        findOne: mockFindOne,
      }),
    });
  });

  it('指定されたslugの記事が取得できること', async () => {
    const mockPost = {
      id: 1,
      title: 'Test Post',
      slug: 'test-post',
      filePath: 'posts/2025/10/test-post.md',
      publishedAt: new Date(),
      author: { name: 'test-author' },
      categories: [],
    };
    mockFindOne.mockResolvedValue(mockPost);

    const req = new NextRequest('http://localhost/api/posts/test-post');
    const response = await GET(req, { params: { slug: 'test-post' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.title).toBe('Test Post');
    expect(data.content).toContain('Hello World');
  });

  it('記事が見つからない場合に404を返すこと', async () => {
    mockFindOne.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/posts/not-found');
    const response = await GET(req, { params: { slug: 'not-found' } });
    expect(response.status).toBe(404);
  });

  it('Markdownファイルが見つからない場合に404を返すこと', async () => {
    const mockPost = {
      id: 1,
      title: 'Test Post',
      filePath: 'posts/2025/10/non-existent-file.md',
    };
    mockFindOne.mockResolvedValue(mockPost);

    const req = new NextRequest('http://localhost/api/posts/test-post');
    const response = await GET(req, { params: { slug: 'test-post' } });
    expect(response.status).toBe(404);
  });
});