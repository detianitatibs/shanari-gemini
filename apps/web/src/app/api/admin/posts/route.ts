import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/db/data-source';
import { Post } from '@/lib/db/entity/Post';
import { Category } from '@/lib/db/entity/Category';
import { getSession } from '@/lib/auth/session';
import * as fs from 'fs/promises';
import path from 'path';
import { In, Like } from 'typeorm';

// Helper function to generate Front Matter
const generateFrontMatter = (data: any): string => {
  const frontMatter: { [key: string]: any } = {
    title: data.title,
    description: data.description || '',
    date: data.published_at ? new Date(data.published_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    image: '""',
    math: false,
    license: 'CC @detain_itatibs',
    slug: '""', // Will be replaced after slug generation
    hidden: data.status !== 'published',
    draft: data.status === 'draft',
    categories: data.categories || [],
    tags: [],
  };

  let content = `---
`;
  for (const key in frontMatter) {
    if (Array.isArray(frontMatter[key])) {
      content += `${key}:
`;
      frontMatter[key].forEach((item: string) => {
        content += `  - ${item}
`;
      });
    } else {
      content += `${key}: ${frontMatter[key]}
`;
    }
  }
  content += `---`;
  return content;
};

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Basic validation
  if (!body.title || !body.content || !body.status || !body.categories || body.categories.length === 0) {
    return NextResponse.json({ message: 'Bad Request: Missing required fields.' }, { status: 400 });
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Generate Slug
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;
    const mainCategory = body.categories[0];
    
    const count = await queryRunner.manager.count(Post, { where: { slug: Like(`${datePrefix}_${mainCategory}_%`) } });
    const newCount = count + 1;
    const slug = `${datePrefix}_${mainCategory}_${newCount}`;

    // 2. Handle Categories
    const categoryEntities = await queryRunner.manager.find(Category, {
      where: { name: In(body.categories) },
    });

    const newCategoryNames = body.categories.filter(
      (catName: string) => !categoryEntities.some(c => c.name === catName)
    );

    const newCategories = newCategoryNames.map((name: string) => {
      const newCat = new Category();
      newCat.name = name;
      return newCat;
    });

    const savedNewCategories = await queryRunner.manager.save(newCategories);
    const allCategories = [...categoryEntities, ...savedNewCategories];

    // 3. Create and Save Post
    const newPost = new Post();
    newPost.title = body.title;
    newPost.slug = slug;
    newPost.status = body.status;
    newPost.publishedAt = body.status === 'published' ? (body.published_at ? new Date(body.published_at) : new Date()) : null;
    newPost.authorId = session.id;
    newPost.categories = allCategories;
    
    // File path generation
    const postsDir = path.join(process.cwd(), 'data', 'posts', year.toString(), month);
    await fs.mkdir(postsDir, { recursive: true });
    const filePath = path.join(postsDir, `${slug}.md`);
    newPost.filePath = path.relative(path.join(process.cwd(), 'data'), filePath);

    const savedPost = await queryRunner.manager.save(newPost);

    // 4. Create and write markdown file
    let frontMatterContent = generateFrontMatter({ ...body, slug });
    frontMatterContent = frontMatterContent.replace('slug: ""', `slug: "${slug}"`);
    const markdownContent = `${frontMatterContent}
${body.content}`;
    await fs.writeFile(filePath, markdownContent);

    await queryRunner.commitTransaction();

    return NextResponse.json({ id: savedPost.id, message: 'Post created successfully' }, { status: 201 });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Failed to create post:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  } finally {
    await queryRunner.release();
  }
}