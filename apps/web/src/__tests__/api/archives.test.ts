/**
 * @jest-environment node
 */

// Mock setup
const mockGetRawMany = jest.fn();
const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  addOrderBy: jest.fn().mockReturnThis(),
  getRawMany: mockGetRawMany,
};

const mockGetRepository = jest.fn(() => ({
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
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
  mockGetRawMany.mockClear();
  Object.values(mockQueryBuilder).forEach(mockFn => {
    if (jest.isMockFunction(mockFn)) {
      mockFn.mockClear();
    }
  });
  mockGetRepository.mockClear();
});

describe('GET /api/archives', () => {
  it('should return a nested list of archives', async () => {
    const { GET } = await import('@/app/api/archives/route');
    const mockArchives = [
      { year: '2025', month: '10', count: 5 },
      { year: '2025', month: '08', count: 4 },
      { year: '2024', month: '12', count: 12 },
    ];
    mockGetRawMany.mockResolvedValue(mockArchives);

    const response = await GET();
    const data = await response.json();

    const expected = [
      {
        year: '2025',
        months: [
          { month: '10', count: 5 },
          { month: '08', count: 4 },
        ],
      },
      {
        year: '2024',
        months: [{ month: '12', count: 12 }],
      },
    ];

    expect(response.status).toBe(200);
    expect(data).toEqual(expected);
    expect(mockGetRepository).toHaveBeenCalledWith(expect.any(Function)); // Post entity
    expect(mockQueryBuilder.select).toHaveBeenCalled();
    expect(mockQueryBuilder.where).toHaveBeenCalledWith("post.status = :status", { status: 'published' });
    expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith('year, month');
    expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('year', 'DESC');
    expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith('month', 'DESC');
  });

  it('should return 500 if there is a server error', async () => {
    const { GET } = await import('@/app/api/archives/route');
    mockGetRawMany.mockRejectedValue(new Error('DB error'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ message: 'Internal Server Error' });
  });
});
