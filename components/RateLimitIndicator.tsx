'use client';

import { useState, useEffect } from 'react';

interface RateLimitData {
  remaining: number;
  limit: number;
  reset: number;
  used: number;
  hasClientToken: boolean;
  hasServerToken: boolean;
  effectiveTokenSource: 'client' | 'server' | null;
  client?: {
    remaining: number;
    limit: number;
    reset: number;
    used: number;
  };
  server?: {
    remaining: number;
    limit: number;
    reset: number;
    used: number;
  };
  totalLimit: number;
  totalRemaining: number;
  _debug?: any;
}

export default function RateLimitIndicator() {
  const [rateLimit, setRateLimit] = useState<RateLimitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchRateLimit = async () => {
      try {
        setLoading(true);

        // Get token from localStorage if available
        const localToken = localStorage.getItem('github_token');

        // Add token to request if available
        let url = '/api/github/rate-limit';
        if (localToken) {
          url += `?token=${encodeURIComponent(localToken)}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch rate limit');
        }

        const data = await response.json();
        console.log('Rate limit data:', data); // Debug log
        setRateLimit(data);
        setError('');
      } catch (err) {
        console.error('Error fetching rate limit:', err);
        setError('Could not fetch GitHub rate limit');
      } finally {
        setLoading(false);
      }
    };

    fetchRateLimit();

    // Refresh rate limit data every minute
    const intervalId = setInterval(fetchRateLimit, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Format reset time
  const formatResetTime = (timestamp: number) => {
    const resetDate = new Date(timestamp * 1000);
    return resetDate.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className='fixed bottom-24 left-4 bg-[#111111] border border-[#222222] rounded-lg p-3 text-sm shadow-lg'>
        <div className='flex items-center gap-2'>
          <div className='animate-spin h-4 w-4 border-2 border-[#8976EA] rounded-full border-t-transparent'></div>
          <span>Checking API quota...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='fixed bottom-24 left-4 bg-[#111111] border border-[#222222] rounded-lg p-3 text-sm shadow-lg text-red-400'>
        {error}
      </div>
    );
  }

  if (!rateLimit) {
    return null;
  }

  // Calculate percentage of rate limit used
  const usedPercentage = Math.max(
    0,
    Math.min(100, Math.round((rateLimit.used / rateLimit.limit) * 100))
  );
  const remainingPercentage = Math.max(
    0,
    Math.min(100, Math.round((rateLimit.remaining / rateLimit.limit) * 100))
  );

  return (
    <div className='fixed bottom-24 left-4 bg-[#111111] border border-[#222222] rounded-lg p-3 text-sm shadow-lg z-50 max-w-xs'>
      <div
        className='font-bold mb-2 flex items-center gap-2 cursor-pointer'
        onClick={() => setExpanded(!expanded)}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            (rateLimit.hasClientToken && rateLimit.client?.remaining === 0) ||
            (rateLimit.hasServerToken && rateLimit.server?.remaining === 0) ||
            (!rateLimit.hasClientToken &&
              !rateLimit.hasServerToken &&
              rateLimit.remaining < 10)
              ? 'bg-red-500'
              : 'bg-green-500'
          }`}
        ></div>
        <span>GitHub API Rate Limit</span>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='16'
          height='16'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className={`ml-auto transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
        >
          <polyline points='6 9 12 15 18 9'></polyline>
        </svg>
      </div>

      {expanded && (
        <>
          {/* Combined total */}
          <div className='mb-3 p-2 bg-[#191919] rounded'>
            <div className='font-medium mb-1'>Combined Total</div>
            <div className='grid grid-cols-2 gap-x-4 gap-y-1'>
              <div>Remaining:</div>
              <div className='font-mono font-bold'>
                {rateLimit.totalRemaining} / {rateLimit.totalLimit}
              </div>
            </div>

            <div className='mt-2'>
              <div className='h-2 bg-[#222] rounded-full overflow-hidden'>
                <div
                  className='h-full bg-[#8976EA]'
                  style={{
                    width: `${Math.round(
                      (rateLimit.totalRemaining /
                        Math.max(1, rateLimit.totalLimit)) *
                        100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Client token stats */}
          {rateLimit.hasClientToken && rateLimit.client && (
            <div className='mb-3 p-2 bg-[#191919] rounded'>
              <div className='font-medium mb-1'>Your Personal Token</div>
              <div className='grid grid-cols-2 gap-x-4 gap-y-1'>
                <div>Remaining:</div>
                <div className='font-mono font-bold'>
                  {rateLimit.client.remaining} / {rateLimit.client.limit}
                </div>

                <div>Used:</div>
                <div className='font-mono'>
                  {rateLimit.client.used} (
                  {Math.round(
                    (rateLimit.client.used / rateLimit.client.limit) * 100
                  )}
                  %)
                </div>

                <div>Reset at:</div>
                <div className='font-mono'>
                  {formatResetTime(rateLimit.client.reset)}
                </div>
              </div>

              <div className='mt-2'>
                <div className='h-2 bg-[#222] rounded-full overflow-hidden'>
                  <div
                    className={`h-full ${
                      rateLimit.client.remaining < 100
                        ? 'bg-yellow-500'
                        : 'bg-[#8976EA]'
                    }`}
                    style={{
                      width: `${Math.round(
                        (rateLimit.client.remaining / rateLimit.client.limit) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Server token stats */}
          {rateLimit.hasServerToken && rateLimit.server && (
            <div className='mb-3 p-2 bg-[#191919] rounded'>
              <div className='font-medium mb-1'>Server Token</div>
              <div className='grid grid-cols-2 gap-x-4 gap-y-1'>
                <div>Remaining:</div>
                <div className='font-mono font-bold'>
                  {rateLimit.server.remaining} / {rateLimit.server.limit}
                </div>

                <div>Used:</div>
                <div className='font-mono'>
                  {rateLimit.server.used} (
                  {Math.round(
                    (rateLimit.server.used / rateLimit.server.limit) * 100
                  )}
                  %)
                </div>

                <div>Reset at:</div>
                <div className='font-mono'>
                  {formatResetTime(rateLimit.server.reset)}
                </div>
              </div>

              <div className='mt-2'>
                <div className='h-2 bg-[#222] rounded-full overflow-hidden'>
                  <div
                    className={`h-full ${
                      rateLimit.server.remaining < 100
                        ? 'bg-yellow-500'
                        : 'bg-[#8976EA]'
                    }`}
                    style={{
                      width: `${Math.round(
                        (rateLimit.server.remaining / rateLimit.server.limit) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Unauthenticated stats */}
          {!rateLimit.hasClientToken && !rateLimit.hasServerToken && (
            <div className='grid grid-cols-2 gap-x-4 gap-y-1'>
              <div>Remaining:</div>
              <div className='font-mono font-bold'>
                {rateLimit.remaining} / {rateLimit.limit}
              </div>

              <div>Used:</div>
              <div className='font-mono'>
                {rateLimit.used} (
                {Math.round((rateLimit.used / rateLimit.limit) * 100)}%)
              </div>

              <div>Reset at:</div>
              <div className='font-mono'>
                {formatResetTime(rateLimit.reset)}
              </div>
            </div>
          )}

          <div className='mt-2 text-xs text-gray-400'>
            {rateLimit.hasClientToken && rateLimit.hasServerToken
              ? 'Using both personal and server tokens for increased rate limits'
              : rateLimit.hasClientToken
              ? 'Using your personal GitHub token'
              : rateLimit.hasServerToken
              ? 'Using server GitHub token'
              : 'No token found. Limited to 60 requests/hour'}
          </div>
        </>
      )}
    </div>
  );
}
