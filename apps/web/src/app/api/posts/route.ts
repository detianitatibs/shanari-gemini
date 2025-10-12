import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/db/data-source';
import { Post } from '@/lib/db/entity/Post';
import { FindManyOptions, FindOptionsWhere, Between } from 'typeorm';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const sort = searchParams.get('sort') || 'publishedAt_desc';
  const category = searchParams.get('category');
  const year = searchParams.get('year');
  const month = searchParams.get('month');

  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const postRepository = AppDataSource.getRepository(Post);

    const where: FindOptionsWhere<Post> = {
      status: 'published',
    };

    if (category) {
      where.categories = { name: category };
    }

    if (year && month) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      where.publishedAt = Between(startDate, endDate);
    }

    const [sortField, sortOrder] = sort.split('_');

    const findOptions: FindManyOptions<Post> = {
      where,
      relations: ['categories'],
      order: { [sortField]: sortOrder.toUpperCase() },
      skip: (page - 1) * limit,
      take: limit,
    };

    const [posts, total] = await postRepository.findAndCount(findOptions);

    const response = {
      posts: posts.map(post => ({
        slug: post.slug,
        title: post.title,
        publishedAt: post.publishedAt,
        categories: post.categories.map(c => ({ id: c.id, name: c.name })),
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
