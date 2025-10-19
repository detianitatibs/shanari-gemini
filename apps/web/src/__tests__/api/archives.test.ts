/**
 * @jest-environment node
 */
import { GET } from '@/app/api/archives/route';
import { NextRequest } from 'next/server';
import { getDbConnection } from '@/lib/db/data-source';

jest.mock('@/lib/db/data-source');

const mockedGetDbConnection = getDbConnection as jest.Mock;

describe('GET /api/archives', () => {
  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  beforeEach(() => {
    Object.values(mockQueryBuilder).forEach(mockFn => mockFn.mockClear());
    mockedGetDbConnection.mockClear();
    mockedGetDbConnection.mockResolvedValue({
      getRepository: () => ({
        createQueryBuilder: () => mockQueryBuilder,
      }),
    });
  });

  it('should return a nested list of archives', async () => {
    const mockRawArchives = [
      { year: '2025', month: '10', count: '5' },
      { year: '2025', month: '8', count: '3' },
      { year: '2024', month: '12', count: '10' },
    ];
    mockQueryBuilder.getRawMany.mockResolvedValue(mockRawArchives);

    const req = new NextRequest('http://localhost/api/archives');
    const response = await GET(req);
    const data = await response.json();

    const expected = [
      { year: '2025', months: [{ month: '10', count: '5' }, { month: '8', count: '3' }] },
      { year: '2024', months: [{ month: '12', count: '10' }] },
    ];

    expect(response.status).toBe(200);
    expect(data).toEqual(expected);
  });

  it('should return 500 on database error', async () => {
    mockQueryBuilder.getRawMany.mockRejectedValue(new Error('DB error'));
    const req = new NextRequest('http://localhost/api/archives');
    const response = await GET(req);
    expect(response.status).toBe(500);
  });
});