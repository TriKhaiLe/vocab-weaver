
// This secret key is used for HMAC signing. It's embedded in the client-side code,
// so it's not for high-security scenarios but is effective at preventing casual
// tampering of the backup file.
const SECRET_KEY_STRING = 'vocab-weaver-hmac-integrity-key-3987d6';
let cryptoKey: CryptoKey | null = null;

/**
 * Creates or retrieves a CryptoKey for HMAC operations.
 * Caches the key in memory for efficiency.
 */
async function getCryptoKey(): Promise<CryptoKey> {
  if (cryptoKey) {
    return cryptoKey;
  }
  const encoder = new TextEncoder();
  const key = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(SECRET_KEY_STRING),
    { name: 'HMAC', hash: 'SHA-256' },
    false, // not exportable
    ['sign', 'verify']
  );
  cryptoKey = key;
  return key;
}

/**
 * Signs a string of data using HMAC-SHA256.
 * @param data The string data to sign.
 * @returns A promise that resolves to the hexadecimal signature string.
 */
export async function signData(data: string): Promise<string> {
  const key = await getCryptoKey();
  const encoder = new TextEncoder();
  const signatureBuffer = await window.crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  );
  // Convert ArrayBuffer to a hexadecimal string
  return Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verifies a signature against a string of data.
 * @param data The original string data.
 * @param signature The hexadecimal signature string to verify.
 * @returns A promise that resolves to true if the signature is valid, false otherwise.
 */
export async function verifyData(data: string, signature: string): Promise<boolean> {
  try {
    const key = await getCryptoKey();
    const encoder = new TextEncoder();
    // Convert the hexadecimal signature string back to an ArrayBuffer
    const sigBytes = new Uint8Array(signature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    
    return await window.crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      encoder.encode(data)
    );
  } catch (error) {
    console.error("Verification error:", error);
    // Errors can occur if the signature string is malformed.
    return false;
  }
}
