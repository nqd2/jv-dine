import {
  BadRequestException,
  PayloadTooLargeException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { UploadedImageFile } from './uploads.service';
import { UploadsService } from './uploads.service';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({}),
  })),
  PutObjectCommand: jest.fn(),
}));

describe('UploadsService', () => {
  const service = new UploadsService();

  beforeEach(() => {
    delete process.env.R2_ENDPOINT;
    delete process.env.R2_ACCOUNT_ID;
    delete process.env.R2_ACCESS_KEY_ID;
    delete process.env.R2_SECRET_ACCESS_KEY;
    delete process.env.R2_BUCKET_NAME;
    delete process.env.R2_PUBLIC_BASE_URL;
  });

  it('returns 503 when R2 is not configured', async () => {
    await expect(
      service.uploadImage({
        buffer: Buffer.from('x'),
        mimetype: 'image/png',
        size: 4,
      } satisfies UploadedImageFile),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('rejects unsupported mime types', async () => {
    process.env.R2_ENDPOINT = 'https://account.r2.cloudflarestorage.com';
    process.env.R2_ACCESS_KEY_ID = 'key';
    process.env.R2_SECRET_ACCESS_KEY = 'secret';
    process.env.R2_BUCKET_NAME = 'bucket';
    process.env.R2_PUBLIC_BASE_URL = 'https://cdn.example.com';

    await expect(
      service.uploadImage({
        buffer: Buffer.from('x'),
        mimetype: 'image/gif',
        size: 4,
      } satisfies UploadedImageFile),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects files larger than 10MB', async () => {
    process.env.R2_ENDPOINT = 'https://account.r2.cloudflarestorage.com';
    process.env.R2_ACCESS_KEY_ID = 'key';
    process.env.R2_SECRET_ACCESS_KEY = 'secret';
    process.env.R2_BUCKET_NAME = 'bucket';
    process.env.R2_PUBLIC_BASE_URL = 'https://cdn.example.com';

    await expect(
      service.uploadImage({
        buffer: Buffer.alloc(0),
        mimetype: 'image/png',
        size: 10 * 1024 * 1024 + 1,
      } satisfies UploadedImageFile),
    ).rejects.toBeInstanceOf(PayloadTooLargeException);
  });

  it('uploads a valid image when R2 is configured', async () => {
    process.env.R2_ENDPOINT = 'https://account.r2.cloudflarestorage.com';
    process.env.R2_ACCESS_KEY_ID = 'key';
    process.env.R2_SECRET_ACCESS_KEY = 'secret';
    process.env.R2_BUCKET_NAME = 'bucket';
    process.env.R2_PUBLIC_BASE_URL = 'https://cdn.example.com';

    const result = await service.uploadImage({
      buffer: Buffer.from('png'),
      mimetype: 'image/png',
      size: 3,
    } satisfies UploadedImageFile);

    expect(result.imageUrl).toMatch(
      /^https:\/\/cdn\.example\.com\/uploads\/.+\.png$/,
    );
    expect(result.key).toMatch(/^uploads\/.+\.png$/);
  });
});
