import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  Injectable,
  PayloadTooLargeException,
} from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getR2Config } from './r2.config';

export type UploadedImageFile = {
  buffer: Buffer;
  mimetype: string;
  size: number;
};

const MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

const EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
};

@Injectable()
export class UploadsService {
  async uploadImage(
    file: UploadedImageFile | undefined,
  ): Promise<{ imageUrl: string; key: string }> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    if (file.size > MAX_BYTES) {
      throw new PayloadTooLargeException('Image must be at most 10MB');
    }

    const mimeType = file.mimetype?.toLowerCase() ?? '';
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new BadRequestException(
        'Only PNG, JPG, JPEG, and WEBP images are allowed',
      );
    }

    const config = getR2Config();
    const ext = EXT_BY_MIME[mimeType] ?? 'bin';
    const key = `uploads/${randomUUID()}.${ext}`;

    const s3 = new S3Client({
      region: 'auto',
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
    });

    await s3.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: mimeType === 'image/jpg' ? 'image/jpeg' : mimeType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );

    return { imageUrl: `${config.publicBaseUrl}/${key}`, key };
  }
}
