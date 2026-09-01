import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
// Server secret key derived from environment or fallback
const SERVER_SECRET = process.env.ENCRYPTION_SECRET || process.env.GEMINI_API_KEY || 'coffee-shop-finder-master-encryption-key-2026';

function getEncryptionKey(): Buffer {
  return crypto.createHash('sha256').update(SERVER_SECRET).digest();
}

/**
 * Encrypts a Google Maps API Key at rest
 */
export function encryptKey(plainText: string): string {
  if (!plainText) return '';
  const iv = crypto.randomBytes(12);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a stored BYOK key on the server
 */
export function decryptKey(encryptedString: string): string {
  if (!encryptedString) return '';
  try {
    const parts = encryptedString.split(':');
    if (parts.length !== 3) return '';
    
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = getEncryptionKey();
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Failed to decrypt BYOK key:', err);
    return '';
  }
}

/**
 * Returns a masked representation of an API key for UI display
 * e.g., AIzaSy...94X8 -> ••••••••••••94X8
 */
export function maskKey(plainText: string): string {
  if (!plainText) return '';
  const trimmed = plainText.trim();
  if (trimmed.length <= 6) return '••••••••';
  const lastFour = trimmed.slice(-4);
  return `••••••••••••${lastFour}`;
}
