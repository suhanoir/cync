import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import sharp from 'sharp';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('photo') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file was provided.' }, { status: 400 });
    }

    // Check mime type (or fallback to extension check if mime is octet-stream)
    const fileType = file.type || '';
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isAllowedExt = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'].includes(ext);

    if (fileType && !ALLOWED_MIME_TYPES.includes(fileType) && !isAllowedExt) {
      return NextResponse.json(
        { error: 'Invalid format. Please upload a JPEG, PNG, WebP, or HEIC photo.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File exceeds 10MB limit. Please choose a smaller photo.' },
        { status: 400 }
      );
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());

    let outputBuffer: Buffer;
    let mimeType = 'image/webp';

    try {
      // Optimize and resize image for fast delivery & zero Vercel serverless filesystem dependency
      outputBuffer = await sharp(inputBuffer)
        .rotate() // Automatically orient photo based on EXIF
        .resize({
          width: 1200,
          height: 1200,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 80, effort: 4 })
        .toBuffer();
    } catch (sharpError) {
      console.warn('Sharp optimization fallback triggered:', sharpError);
      outputBuffer = inputBuffer;
      mimeType = fileType || 'image/jpeg';
    }

    // Generate safe, persistent Data URL that works on Vercel without ephemeral filesystem loss
    const dataUrl = `data:${mimeType};base64,${outputBuffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
    });
  } catch (err: any) {
    console.error('Error handling upload:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to process image upload.' },
      { status: 500 }
    );
  }
}
