import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { lookup } from 'mime-types';

export async function GET(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any,
) {
  const { slug } = context.params;

  if (!slug || !Array.isArray(slug) || slug.length === 0) {
    return NextResponse.json(
      { error: 'Image path is required.' },
      { status: 400 },
    );
  }

  const imagePath = path.join(process.cwd(), 'data', 'images', ...slug);

  try {
    const fileBuffer = await fs.readFile(imagePath);
    const mimeType = lookup(imagePath) || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    // Check if the error is a file-not-found error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return NextResponse.json({ error: 'Image not found.' }, { status: 404 });
    }
    // For other errors, return a generic 500
    console.error(`Failed to serve image at ${imagePath}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
