// ---------------------------------------------
// apiClient.ts
// Lightweight wrapper around the Fetch API.
// Provides:
//   • Base URL handling
//   • JSON conversion
//   • Consistent error formatting
// ---------------------------------------------

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // Uses environment variable for backend location
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  const res = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  // Any non-OK status is treated as an error
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  // Parse JSON response into expected type
  return res.json() as Promise<T>;
}
