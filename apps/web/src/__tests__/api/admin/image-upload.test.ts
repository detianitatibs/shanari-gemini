/**
 * @jest-environment node
 */
import { POST as uploadHandler } from '@/app/api/admin/image-upload/route';
import { GET as serveHandler } from '@/app/api/images/[...slug]/route';
import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

describe('Image Upload and Serving API', () => {
  const uploadedImagePaths: string[] = [];

  afterAll(async () => {
    // Clean up all created images
    for (const imagePath of uploadedImagePaths) {
      try {
        await fs.unlink(imagePath);
        // Clean up directories. This might fail if dirs are not empty, which is fine.
        const dir = path.dirname(imagePath);
        const yearDir = path.dirname(dir);
        await fs.rmdir(dir).catch(() => {});
        await fs.rmdir(yearDir).catch(() => {});
      } catch {
        // Ignore errors if files don't exist
      }
    }
  });

  let imageUrl: string;

  it('should reject upload if no file is provided', async () => {
    const formData = new FormData();
    const request = new NextRequest('http://localhost/api/admin/image-upload', {
      method: 'POST',
      body: formData,
    });

    const response = await uploadHandler(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('File is required.');
  });

  it('should upload an image and return its URL', async () => {
    const fileContent = 'fake image content';
    const blob = new Blob([fileContent], { type: 'image/png' });
    const formData = new FormData();
    formData.append('file', blob, 'test-image.png');

    const request = new NextRequest('http://localhost/api/admin/image-upload', {
      method: 'POST',
      body: formData,
    });

    const response = await uploadHandler(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty('url');
    expect(body.url).toMatch(/^\/api\/images\/\d{4}\/\d{2}\/.+\.png$/);

    imageUrl = body.url; // Save for the next test

    // Verify the file was created
    const imagePath = path.join(
      process.cwd(),
      'data',
      imageUrl.replace('/api/', ''),
    );
    uploadedImagePaths.push(imagePath); // Add to cleanup list

    const stats = await fs.stat(imagePath);
    expect(stats.isFile()).toBe(true);
    const content = await fs.readFile(imagePath, 'utf-8');
    expect(content).toBe(fileContent);
  });

  it('should serve the uploaded image', async () => {
    if (!imageUrl) {
      throw new Error('imageUrl is not set from the upload test.');
    }

    const slug = imageUrl.replace('/api/images/', '').split('/');
    const request = new NextRequest(`http://localhost${imageUrl}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context: any = { params: { slug } };

    const response = await serveHandler(request, context);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/png');

    const responseBuffer = Buffer.from(await response.arrayBuffer());
    expect(responseBuffer.toString()).toBe('fake image content');
  });

  it('should return 404 for a non-existent image', async () => {
    const slug = ['2025', '01', 'non-existent-image.jpg'];
    const request = new NextRequest(
      'http://localhost/api/images/2025/01/non-existent-image.jpg',
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context: any = { params: { slug } };

    const response = await serveHandler(request, context);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe('Image not found.');
  });
});
