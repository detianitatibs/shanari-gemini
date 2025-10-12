import { NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/db/data-source';
import { Category } from '@/lib/db/entity/Category';

export async function GET(request: NextRequest) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const categoryRepository = AppDataSource.getRepository(Category);

    const categories = await categoryRepository.find({
      order: { name: 'ASC' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
