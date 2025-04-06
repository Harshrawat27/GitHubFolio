'use client';

import { useState, useEffect } from 'react';

interface GitHubAuthProps {
  onTokenChange: (token: string | null) => void;
}

export default function GitHubAuth({ onTokenChange }: GitHubAuthProps) {
  const [token, setToken] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [rateLimit, setRateLimit] = useState<{
    remaining: number;
    limit: number;
    tokenSource: 'client' | 'server' | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for token in localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('github_token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      onTokenChange(storedToken);
      checkRateLimit(storedToken);
    } else {
      // Check rate limit using server token if available
      checkRateLimit(null);
    }
  }, [onTokenChange]);

  // Check rate limit information
  const checkRateLimit = async (authToken: string | null) => {
    try {
      const url = authToken
        ? `/api/github/rate-limit?token=${encodeURIComponent(authToken)}`
        : '/api/github/rate-limit';

      const response = await fetch(url);
      const data = await response.json();

      setRateLimit({
        remaining: data.rate.remaining,
        limit: data.rate.limit,
        tokenSource: data.tokenSource,
      });
    } catch (error) {
      console.error('Error checking rate limit:', error);
    }
  };

  // Save token and set authentication state
  const handleAuthenticate = async () => {
    if (!token.trim()) return;

    setLoading(true);

    try {
      // Verify the token works by making a test request
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token}`,
        },
      });

      if (response.ok) {
        localStorage.setItem('github_token', token);
        setIsAuthenticated(true);
        onTokenChange(token);
        checkRateLimit(token);
      } else {
        alert('Invalid token or insufficient permissions');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Failed to authenticate with GitHub');
    } finally {
      setLoading(false);
    }
  };

  // Clear token and reset state
  const handleLogout = () => {
    localStorage.removeItem('github_token');
    setToken('');
    setIsAuthenticated(false);
    onTokenChange(null);
    checkRateLimit(null); // Check rate limit using server token if available
  };

  return (
    <div className='bg-white p-4 rounded-lg shadow-md mb-4'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h3 className='text-lg font-medium'>GitHub API Access</h3>
          <div className='text-sm text-gray-600 mt-1'>
            {rateLimit ? (
              <p>
                Rate limit: {rateLimit.remaining} / {rateLimit.limit} requests
                remaining
                {rateLimit.remaining < 10 && (
                  <span className='text-red-500 ml-1'>
                    (Low! Add a token to increase limit)
                  </span>
                )}
                {rateLimit.tokenSource && (
                  <span className='ml-1 text-xs'>
                    (
                    {rateLimit.tokenSource === 'client'
                      ? 'Your token'
                      : 'Server token'}
                    )
                  </span>
                )}
              </p>
            ) : (
              <p>Checking rate limit...</p>
            )}
          </div>
        </div>

        <div className='flex-grow max-w-md'>
          {!isAuthenticated ? (
            <div className='flex gap-2'>
              <input
                type='password'
                placeholder='Enter GitHub personal access token'
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className='flex-grow p-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <button
                onClick={handleAuthenticate}
                disabled={loading || !token.trim()}
                className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                {loading ? 'Verifying...' : 'Apply'}
              </button>
            </div>
          ) : (
            <div className='flex justify-end'>
              <button
                onClick={handleLogout}
                className='bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm'
              >
                Remove Token
              </button>
            </div>
          )}
        </div>
      </div>

      <div className='mt-2 text-xs text-gray-500'>
        {!isAuthenticated && (
          <p>
            Add a GitHub personal access token to increase rate limits from 60
            to 5,000 requests/hour.{' '}
            <a
              href='https://github.com/settings/tokens'
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 hover:underline'
            >
              Generate token
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
