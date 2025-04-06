/**
 * GitHub token helper for consistent handling of GitHub API tokens.
 * This prioritizes the environment variable token over client-side tokens
 * for better security and higher rate limits.
 */

/**
 * Get GitHub access token with the following priority:
 * 1. Environment variable (server-side)
 * 2. Local storage token (client-side)
 */
export function getGitHubToken(): string | null {
  // On the server side
  if (typeof window === 'undefined') {
    // Server-side execution
    return process.env.GITHUB_ACCESS_TOKEN || null;
  }

  // On the client side
  // First try environment variable made public to client (if any)
  if (process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN) {
    return process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN;
  }

  // Fall back to client storage
  return localStorage.getItem('github_token');
}

/**
 * Creates headers for GitHub API requests with the token if available
 */
export function createGitHubHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'GitHubFolio',
  };

  const token = getGitHubToken();
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  return headers;
}
