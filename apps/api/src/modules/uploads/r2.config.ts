import { ServiceUnavailableException } from '@nestjs/common';

export type R2Config = {
  endpoint: string;
  bucket: string;
  publicBaseUrl: string;
  accessKeyId: string;
  secretAccessKey: string;
};

function normalizeBaseUrl(url: string): string {
  let value = url.trim().replace(/^["']|["']$/g, '');
  while (value.endsWith('/')) {
    value = value.slice(0, -1);
  }
  return value;
}

function normalizeBucket(raw: string): string {
  let bucket = raw.trim().replace(/^["']|["']$/g, '');
  bucket = bucket.replace(/^\/+|\/+$/g, '');
  const segment = bucket.split('/').filter(Boolean)[0];
  return segment ?? bucket;
}

function resolveR2Endpoint(): string | null {
  const fromEnv =
    typeof process.env.R2_ENDPOINT === 'string'
      ? normalizeBaseUrl(process.env.R2_ENDPOINT)
      : '';
  if (fromEnv) {
    return fromEnv.startsWith('http') ? fromEnv : `https://${fromEnv}`;
  }

  const accountId =
    typeof process.env.R2_ACCOUNT_ID === 'string'
      ? process.env.R2_ACCOUNT_ID.trim().replace(/^["']|["']$/g, '')
      : '';
  if (!accountId) {
    return null;
  }
  return `https://${accountId}.r2.cloudflarestorage.com`;
}

export function getR2Config(): R2Config {
  const endpoint = resolveR2Endpoint();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.trim();

  if (
    !endpoint ||
    !accessKeyId ||
    !secretAccessKey ||
    !bucket ||
    !publicBaseUrl
  ) {
    throw new ServiceUnavailableException(
      'Image upload is not configured (missing R2_* environment variables)',
    );
  }

  return {
    endpoint,
    accessKeyId,
    secretAccessKey,
    bucket: normalizeBucket(bucket),
    publicBaseUrl: normalizeBaseUrl(publicBaseUrl),
  };
}
