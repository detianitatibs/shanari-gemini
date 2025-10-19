/**
 * @jest-environment node
 */
import { GET } from '@/app/api/categories/route';
import { NextRequest } from 'next/server';
import { getDbConnection } from '@/lib/db/data-source';

jest.mock('@/lib/db/data-source');

const mockedGetDbConnection = getDbConnection as jest.Mock;

describe('GET /api/categories', () => {
  const mockFind = jest.fn();

  beforeEach(() => {
    mockFind.mockClear();
    mockedGetDbConnection.mockClear();
    mockedGetDbConnection.mockResolvedValue({
      getRepository: () => ({
        find: mockFind,
      }),
    });
  });

  it('should return a list of categories sorted by name', async () => {
    const mockCategories = [
      { id: 1, name: 'Category A' },
      { id: 2, name: 'Category B' },
    ];
    mockFind.mockResolvedValue(mockCategories);

    const req = new NextRequest('http://localhost/api/categories');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockCategories);
    expect(mockFind).toHaveBeenCalledWith({ order: { name: 'ASC' } });
  });

  it('should return 500 on database error', async () => {
    mockFind.mockRejectedValue(new Error('DB error'));

    const req = new NextRequest('http://localhost/api/categories');
    const response = await GET(req);

    expect(response.status).toBe(500);
  });
});