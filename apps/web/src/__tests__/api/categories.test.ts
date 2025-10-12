/**
 * @jest-environment node
 */

import { createRequest } from 'node-mocks-http';
import { NextRequest } from 'next/server';

// Mock setup
const mockFind = jest.fn();
const mockGetRepository = jest.fn(() => ({
  find: mockFind,
}));

jest.doMock('@/lib/db/data-source', () => ({
  AppDataSource: {
    isInitialized: true,
    getRepository: mockGetRepository,
    initialize: jest.fn().mockResolvedValue(undefined),
  },
}));

beforeEach(() => {
  jest.resetModules();
  mockFind.mockClear();
  mockGetRepository.mockClear();
});

describe('GET /api/categories', () => {
  const createMockRequest = (url: string) => {
    const req = createRequest({
      method: 'GET',
      url,
    });
    return req as unknown as NextRequest;
  };

  it('should return a list of categories sorted by name', async () => {
    const { GET } = await import('@/app/api/categories/route');
    const mockCategories = [
      { id: 2, name: 'B Category' },
      { id: 1, name: 'A Category' },
    ];
    mockFind.mockResolvedValue(mockCategories);

    const req = createMockRequest('/api/categories');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockCategories);
    expect(mockFind).toHaveBeenCalledWith({ order: { name: 'ASC' } });
  });

  it('should return 500 if there is a server error', async () => {
    const { GET } = await import('@/app/api/categories/route');
    mockFind.mockRejectedValue(new Error('DB error'));

    const req = createMockRequest('/api/categories');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ message: 'Internal Server Error' });
  });
});
