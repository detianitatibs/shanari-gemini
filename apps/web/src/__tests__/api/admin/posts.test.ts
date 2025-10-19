/**
 * @jest-environment node
 */
import { POST } from '@/app/api/admin/posts/route';
import { PUT, DELETE } from '@/app/api/admin/posts/[id]/route';
import { NextRequest } from 'next/server';
import { getDbConnection } from '@/lib/db/data-source';
import { BaseEntity } from 'typeorm';

jest.mock('@/lib/db/data-source');
jest.mock('@/lib/auth/session', () => ({
  getSession: jest.fn().mockResolvedValue({ id: 1, name: 'dev-user' }),
}));

const mockedGetDbConnection = getDbConnection as jest.Mock;

describe('/api/admin/posts', () => {
  const mockSave = jest.fn();
  const mockFindOneBy = jest.fn();
  const mockDelete = jest.fn();
  const mockGetRepository = jest.fn();
  const mockCommitTransaction = jest.fn();
  const mockRollbackTransaction = jest.fn();
  const mockRelease = jest.fn();

  beforeEach(() => {
    mockSave.mockClear();
    mockSave.mockImplementation(entity => Promise.resolve(Array.isArray(entity) ? entity : [entity]));
    mockFindOneBy.mockClear();
    mockDelete.mockClear();
    mockGetRepository.mockClear();
    mockedGetDbConnection.mockClear();
    mockCommitTransaction.mockClear();
    mockRollbackTransaction.mockClear();
    mockRelease.mockClear();

    mockedGetDbConnection.mockResolvedValue({
      createQueryRunner: () => ({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: mockCommitTransaction,
        rollbackTransaction: mockRollbackTransaction,
        release: mockRelease,
        manager: {
          findOneBy: mockFindOneBy,
          count: jest.fn().mockResolvedValue(0),
          find: jest.fn().mockResolvedValue([]),
          save: mockSave,
          getRepository: mockGetRepository,
        },
      }),
    });

    mockGetRepository.mockImplementation((entity: typeof BaseEntity) => {
      if (entity && entity.name === 'Post') {
        return {
          save: mockSave,
          findOneBy: mockFindOneBy,
          findOne: mockFindOneBy,
          delete: mockDelete,
          remove: mockDelete,
        };
      }
      return { save: mockSave };
    });
  });

  describe('POST', () => {
    it('should create a post and return 201', async () => {
      mockFindOneBy.mockResolvedValue({ id: 1, name: 'dev-user' });
      mockSave.mockResolvedValueOnce([]).mockResolvedValueOnce({ id: 1, title: 'New Post' });
      const req = new NextRequest('http://localhost/api/admin/posts', {
        method: 'POST',
        body: JSON.stringify({ title: 'New Post', content: 'Content', status: 'draft', categories: ['test'] }),
      });

      const response = await POST(req);
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.id).toBe(1);
      expect(mockCommitTransaction).toHaveBeenCalled();
    });
  });

  describe('PUT', () => {
    it('should update a post and return 200', async () => {
      mockFindOneBy.mockResolvedValue({ id: 1, title: 'Old Post', filePath: 'path/to/file.md' });
      mockSave.mockResolvedValueOnce([]).mockResolvedValueOnce({ id: 1, title: 'Updated Post' });

      const req = new NextRequest('http://localhost/api/admin/posts/1', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated Post', content: 'Updated', status: 'draft', categories: ['test'] }),
      });

      const response = await PUT(req, { params: { id: '1' } });
      expect(response.status).toBe(200);
      expect(mockCommitTransaction).toHaveBeenCalled();
    });

    it('should return 404 if post not found', async () => {
      mockFindOneBy.mockResolvedValue(null);
      const req = new NextRequest('http://localhost/api/admin/posts/999', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated Post' }),
      });

      const response = await PUT(req, { params: { id: '999' } });
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE', () => {
    it('should delete a post and return 204', async () => {
      mockFindOneBy.mockResolvedValue({ id: 1, title: 'Test Post', filePath: 'path/to/file.md' });
      mockDelete.mockResolvedValue({ affected: 1 });
      const req = new NextRequest('http://localhost/api/admin/posts/1', {
        method: 'DELETE',
      });

      const response = await DELETE(req, { params: { id: '1' } });
      expect(response.status).toBe(204);
    });
  });
});