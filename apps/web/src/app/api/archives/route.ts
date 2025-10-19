import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db/data-source';
import { Post } from '@/lib/db/entity/Post';

export async function GET(_request: NextRequest) {
  try {
    const connection = await getDbConnection();
    const postRepository = connection.getRepository(Post);

    const archives = await postRepository
      .createQueryBuilder('post')
      .select("strftime('%Y', post.publishedAt) as year, strftime('%m', post.publishedAt) as month, COUNT(post.id) as count")
      .where("post.status = :status", { status: 'published' })
      .andWhere("post.publishedAt IS NOT NULL")
      .groupBy('year, month')
      .orderBy('year', 'DESC')
      .addOrderBy('month', 'DESC')
      .getRawMany();

    // クエリ結果をネストした構造に変換
    const result = archives.reduce((acc, { year, month, count }) => {
      const yearEntry = acc.find((e: { year: string; }) => e.year === year);
      if (yearEntry) {
        yearEntry.months.push({ month, count });
      } else {
        acc.push({ year, months: [{ month, count }] });
      }
      return acc;
    }, [] as { year: string; months: { month: string; count: number }[] }[]);

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
