
/**
 * @jest-environment node
 */

jest.mock('fs/promises', () => ({
    __esModule: true,
    mkdir: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockResolvedValue(undefined),
    unlink: jest.fn().mockResolvedValue(undefined),
}));

import { createRequest } from 'node-mocks-http';
import { NextRequest } from 'next/server';
import { POST as adminPost } from '@/app/api/admin/posts/route';
import { PUT, DELETE } from '@/app/api/admin/posts/[id]/route';
import * as fs from 'fs/promises';

// Mocks
const mockAdminUser = { id: 1, name: 'Admin User', email: 'admin@example.com' };

const mockSave = jest.fn(entity => {
  if (Array.isArray(entity)) {
    return Promise.resolve(entity.map(e => ({ ...e, id: e.id || Date.now() })));
  }
  return Promise.resolve({ ...entity, id: entity.id || Date.now() });
});
const mockRemove = jest.fn(entity => Promise.resolve(entity));
const mockFindOne = jest.fn();
const mockFind = jest.fn();
const mockCount = jest.fn();

const mockCommitTransaction = jest.fn();
const mockRollbackTransaction = jest.fn();
const mockRelease = jest.fn();
const mockStartTransaction = jest.fn();

const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: mockStartTransaction,
  commitTransaction: mockCommitTransaction,
  rollbackTransaction: mockRollbackTransaction,
  release: mockRelease,
  manager: {
    save: mockSave,
    remove: mockRemove,
    findOne: mockFindOne,
    find: mockFind,
    count: mockCount,
    getRepository: jest.fn(() => ({
        save: mockSave,
        remove: mockRemove,
        findOne: mockFindOne,
        findOneBy: mockFindOne,
    }))
  },
};

jest.mock('@/lib/auth/session', () => ({
  getSession: jest.fn(),
}));

jest.mock('@/lib/db/data-source', () => ({
  AppDataSource: {
    isInitialized: true,
    createQueryRunner: jest.fn(() => mockQueryRunner),
    initialize: jest.fn().mockResolvedValue(undefined),
  },
}));

import { getSession } from '@/lib/auth/session';

beforeEach(() => {
  jest.clearAllMocks();
  (getSession as jest.Mock).mockResolvedValue(mockAdminUser);
});

const createMockRequest = (method: string, body?: any, url = '/api/admin/posts') => {
  const fullUrl = `http://localhost${url}`;
  return new NextRequest(new Request(fullUrl, { method, body: body ? JSON.stringify(body) : null, headers: { 'Content-Type': 'application/json' } }));
};

describe('/api/admin/posts', () => {
  describe('POST', () => {
    const validPostBody = {
      title: 'New Post',
      content: 'This is content',
      status: 'draft',
      categories: ['daily'],
    };

    it('should create a post and return 201', async () => {
      mockCount.mockResolvedValue(0);
      mockFind.mockResolvedValue([]);

      const req = createMockRequest('POST', validPostBody);
      const response = await adminPost(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(getSession).toHaveBeenCalled();
      expect(mockStartTransaction).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
      expect(mockCommitTransaction).toHaveBeenCalled();
      expect(mockRelease).toHaveBeenCalled();
      expect(data.message).toBe('Post created successfully');
    });

    it('should return 401 if not authenticated', async () => {
        (getSession as jest.Mock).mockResolvedValue(null);
        const req = createMockRequest('POST', validPostBody);
        const response = await adminPost(req);
        expect(response.status).toBe(401);
    });

    it('should return 400 for bad request', async () => {
        const req = createMockRequest('POST', { title: 'only title' });
        const response = await adminPost(req);
        expect(response.status).toBe(400);
    });
  });

  describe('PUT', () => {
    const validPutBody = {
        title: 'Updated Post',
        content: 'This is updated content',
        status: 'published',
        categories: ['game'],
        published_at: new Date().toISOString(),
      };
    const mockPost = { id: 1, slug: '20250101_game_1', filePath: 'posts/2025/01/20250101_game_1.md' };

    it('should update a post and return 200', async () => {
        mockFindOne.mockResolvedValue(mockPost);
        mockFind.mockResolvedValue([]);

        const req = createMockRequest('PUT', validPutBody, `/api/admin/posts/${mockPost.id}`);
        const response = await PUT(req, { params: { id: '1' } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(mockFindOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['categories'] });
        expect(mockSave).toHaveBeenCalled();
        expect(fs.writeFile).toHaveBeenCalled();
        expect(mockCommitTransaction).toHaveBeenCalled();
        expect(data.message).toBe('Post updated successfully');
    });

    it('should return 404 if post not found', async () => {
        mockFindOne.mockResolvedValue(null);
        const req = createMockRequest('PUT', validPutBody, '/api/admin/posts/999');
        const response = await PUT(req, { params: { id: '999' } });
        expect(response.status).toBe(404);
    });
  });

  describe('DELETE', () => {
    const mockPost = { id: 1, filePath: 'posts/2025/01/somefile.md' };

    it('should delete a post and return 204', async () => {
        mockFindOne.mockResolvedValue(mockPost);

        const req = createMockRequest('DELETE', undefined, `/api/admin/posts/${mockPost.id}`);
        const response = await DELETE(req, { params: { id: '1' } });

        expect(response.status).toBe(204);
        expect(mockFindOne).toHaveBeenCalledWith({ id: 1 });
        expect(mockRemove).toHaveBeenCalledWith(mockPost);
        expect(fs.unlink).toHaveBeenCalled();
        expect(mockCommitTransaction).toHaveBeenCalled();
    });

    it('should return 404 if post not found for deletion', async () => {
        mockFindOne.mockResolvedValue(null);
        const req = createMockRequest('DELETE', undefined, '/api/admin/posts/999');
        const response = await DELETE(req, { params: { id: '999' } });
        expect(response.status).toBe(404);
    });
  });
});
