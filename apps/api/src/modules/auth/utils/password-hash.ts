import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const HASH_PREFIX = 'scrypt';
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const key = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${HASH_PREFIX}:${salt}:${key.toString('hex')}`;
}

export async function verifyPassword(
  password: string,
  storedPassword: string,
): Promise<boolean> {
  const [prefix, salt, storedKey] = storedPassword.split(':');

  if (prefix !== HASH_PREFIX || !salt || !storedKey) {
    return password === storedPassword;
  }

  const key = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  const stored = Buffer.from(storedKey, 'hex');

  if (key.length !== stored.length) {
    return false;
  }

  return timingSafeEqual(key, stored);
}
