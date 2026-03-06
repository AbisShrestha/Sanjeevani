import { SERVER_URL } from '../services/api';

// Normalize any image path coming from the API into a valid URI React Native can load.
// - Accepts full URLs (http/https), file:// and data: URIs unchanged.
// - Converts Windows-style backslashes to forward slashes.
// - Prefixes relative paths with SERVER_URL and ensures a single leading slash.
// - Returns the provided fallback when the input is empty/undefined/null.
export const buildImageUri = (
  path: string | null | undefined,
  fallback: string | null = null
): string | null => {
  if (!path) return fallback;

  const clean = String(path).replace(/\\/g, '/').trim();

  if (!clean || clean.toLowerCase() === 'undefined' || clean.toLowerCase() === 'null') {
    return fallback;
  }

  if (clean.startsWith('http') || clean.startsWith('file:') || clean.startsWith('data:')) {
    return encodeURI(clean);
  }

  const withSlash = clean.startsWith('/') ? clean : `/${clean}`;
  return `${SERVER_URL}${encodeURI(withSlash)}`;
};
