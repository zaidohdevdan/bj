/**
 * Utilitários de criptografia client-side (AES-GCM)
 * O servidor nunca tem acesso à chave ou ao conteúdo em texto puro.
 */

const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_DERIVATION_ALGORITHM = 'PBKDF2';
const HASH_ALGORITHM = 'SHA-256';
const ITERATIONS = 100000;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Deriva uma chave criptográfica a partir de uma senha e um salt (roomId)
 */
async function deriveKey(passphrase: string, salt: string) {
  const encoder = new TextEncoder();
  const passphraseBytes = encoder.encode(passphrase.trim());
  const saltBytes = encoder.encode(salt.trim());

  console.log(`[Crypto] Deriving key: PassLen=${passphrase.length}, Salt=${salt}`);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    passphraseBytes,
    { name: KEY_DERIVATION_ALGORITHM },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: KEY_DERIVATION_ALGORITHM,
      salt: saltBytes,
      iterations: ITERATIONS,
      hash: HASH_ALGORITHM,
    },
    baseKey,
    { name: ENCRYPTION_ALGORITHM, length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Gera um fingerprint da chave para depuração (SHA-256)
 */
export async function getKeyFingerprint(passphrase: string, roomId: string): Promise<string> {
  try {
    const key = await deriveKey(passphrase, roomId);
    const exported = await crypto.subtle.exportKey('raw', key);
    const hash = await crypto.subtle.digest('SHA-256', exported);
    
    let binary = '';
    const bytes = new Uint8Array(hash);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch {
    return 'error';
  }
}

/**
 * Encripta uma mensagem usando a senha da sala
 */
export async function encryptMessage(message: string, passphrase: string, roomId: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const key = await deriveKey(passphrase, roomId);
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: ENCRYPTION_ALGORITHM, iv },
      key,
      data
    );

    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);

    return arrayBufferToBase64(combined.buffer);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Falha ao encriptar mensagem');
  }
}

/**
 * Decripta uma mensagem usando a senha da sala
 */
export async function decryptMessage(encryptedBase64: string, passphrase: string, roomId: string): Promise<string> {
  try {
    const combined = base64ToArrayBuffer(encryptedBase64);
    
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const key = await deriveKey(passphrase, roomId);

    const decrypted = await crypto.subtle.decrypt(
      { name: ENCRYPTION_ALGORITHM, iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Falha ao decriptar mensagem - Verifique se a palavra-passe está correta');
  }
}
