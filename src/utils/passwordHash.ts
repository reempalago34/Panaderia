// Utilidad de hash de contraseñas sin dependencias externas (Web Crypto / SHA-256 con fallback simple).
const SALT = 'mazamadre::';

export const PREFIX = 'sha256$';

// Hash precalculado de la contraseña demo del administrador: 'Admin123'
export const HASHED_ADMIN_PASSWORD = `${PREFIX}407b8bfc067773fff325a6efff6fd924c5f362d48d908aab1cdf2a60eaf7f809`;

export const hashPassword = async (password: string): Promise<string> => {
  const input = `${SALT}${password}`;
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const data = new TextEncoder().encode(input);
      const digest = await crypto.subtle.digest('SHA-256', data);
      const hex = Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      return `${PREFIX}${hex}`;
    }
  } catch {
    // Fall through to fallback below
  }
  // Fallback síncrono simple (no-crypto contexts, p.ej. HTTP puro)
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex = `fallback${(h2 >>> 0).toString(16).padStart(8, '0')}${(h1 >>> 0).toString(16).padStart(8, '0')}`;
  return `${PREFIX}${hex}`;
};

export const isHashedPassword = (value: string): boolean => value?.startsWith(PREFIX);