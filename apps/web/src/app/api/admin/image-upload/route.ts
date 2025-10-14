import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { verifyAdmin } from '@/lib/auth/session';
import { randomBytes } from 'crypto';
import { format } from 'date-fns';

export async function POST(request: NextRequest) {
  // In development, auth is mocked, so this check is skipped.
  if (process.env.NODE_ENV === 'production') {
    const unauthorizedResponse = await verifyAdmin(request);
    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'File is required.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Generate a unique filename based on the design doc
  const now = new Date();
  const year = format(now, 'yyyy');
  const month = format(now, 'MM');
  const day = format(now, 'dd');
  const timestamp = `${year}${month}${day}`;
  const randomString = randomBytes(8).toString('hex');
  const extension = path.extname(file.name);
  const filename = `${timestamp}_${randomString}${extension}`;

  // Local dev simulates GCS by saving to the `data` directory.
  const saveDir = path.join(process.cwd(), 'data', 'images', year, month);
  const savePath = path.join(saveDir, filename);

  // The URL returned will point to a new API route for serving these images.
  const imageUrl = `/api/images/${year}/${month}/${filename}`;

  try {
    await fs.mkdir(saveDir, { recursive: true });
    await fs.writeFile(savePath, buffer);

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error('Failed to save image:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
