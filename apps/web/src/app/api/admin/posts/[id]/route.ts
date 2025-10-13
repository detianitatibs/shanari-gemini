import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/db/data-source';
import { Post } from '@/lib/db/entity/Post';
import { Category } from '@/lib/db/entity/Category';
import { getSession } from '@/lib/auth/session';
import * as fs from 'fs/promises';
import path from 'path';
import { In } from 'typeorm';

interface FrontMatterData {
    title: string;
    description?: string;
    published_at?: string;
    slug: string;
    status: 'published' | 'draft';
    categories: string[];
}

// Helper function to generate Front Matter
const generateFrontMatter = (data: FrontMatterData): string => {
    const frontMatter: { [key: string]: string | boolean | string[] } = {
        title: data.title,
        description: data.description || '',
        date: data.published_at ? new Date(data.published_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        image: '""',
        math: false,
        license: 'CC @detain_itatibs',
        slug: data.slug,
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
            (frontMatter[key] as string[]).forEach((item: string) => {
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

export async function PUT(
    request: NextRequest,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: any
) {
    const { params } = context;
    const session = await getSession(request);
    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
        return NextResponse.json({ message: 'Invalid post ID' }, { status: 400 });
    }

    const body = await request.json();
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
        const postRepository = queryRunner.manager.getRepository(Post);
        const post = await postRepository.findOne({ where: { id }, relations: ['categories'] });

        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        // Handle Categories
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

        // Update Post
        post.title = body.title;
        post.status = body.status;
        post.publishedAt = body.status === 'published' ? (body.published_at ? new Date(body.published_at) : new Date()) : null;
        post.categories = allCategories;

        // Update markdown file
        const frontMatterContent = generateFrontMatter({ ...body, slug: post.slug });
        const markdownContent = `${frontMatterContent}
${body.content}`;
        const filePath = path.join(process.cwd(), 'data', post.filePath);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, markdownContent);

        await queryRunner.manager.save(post);
        await queryRunner.commitTransaction();

        return NextResponse.json({ id: post.id, message: 'Post updated successfully' });
    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('Failed to update post:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        await queryRunner.release();
    }
}

export async function DELETE(
    request: NextRequest,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: any
) {
    const { params } = context;
    const session = await getSession(request);
    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
        return NextResponse.json({ message: 'Invalid post ID' }, { status: 400 });
    }

    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const postRepository = queryRunner.manager.getRepository(Post);
        const post = await postRepository.findOneBy({ id });

        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        // Delete markdown file
        const filePath = path.join(process.cwd(), 'data', post.filePath);
        try {
            await fs.unlink(filePath);
        } catch (error) {
            if (error instanceof Error && 'code' in error && error.code !== 'ENOENT') {
                throw error;
            }
        }

        // Delete post from DB
        await postRepository.remove(post);
        await queryRunner.commitTransaction();

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('Failed to delete post:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        await queryRunner.release();
    }
}
