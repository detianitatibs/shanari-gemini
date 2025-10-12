import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/db/data-source';
import { Post } from '@/lib/db/entity/Post';
import { promises as fs } from 'fs';
import path from 'path';

function isErrorWithCode(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;

  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const postRepository = AppDataSource.getRepository(Post);

    const post = await postRepository.findOne({
      where: { slug, status: 'published' },
      relations: ['categories', 'author'],
    });

    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    // GCSの代わりにローカルファイルシステムからMarkdownファイルを取得
    // プロジェクトルートからの相対パスとして解決する
    const filePath = path.join(process.cwd(), post.filePath);
    const content = await fs.readFile(filePath, 'utf-8');

    const response = {
      slug: post.slug,
      title: post.title,
      content, // Markdownの生の内容
      publishedAt: post.publishedAt,
      author: {
        name: post.author.name,
      },
      categories: post.categories.map(c => ({ id: c.id, name: c.name })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('API Error:', error);
    // ファイルが存在しない場合のエラーハンドリング
    if (isErrorWithCode(error) && error.code === 'ENOENT') {
      return NextResponse.json({ message: 'Post content not found' }, { status: 404 });
    }
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
