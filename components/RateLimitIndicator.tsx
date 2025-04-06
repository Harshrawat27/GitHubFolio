// components/RateLimitIndicator.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/ThemeProvider';

interface RateLimitData {
  remaining: number;
  limit: number;
  reset: number;
  used: number;
  hasEnvToken: boolean;
  hasClientToken: boolean;
  tokenSource: 'environment' | 'client' | null;
  resources?: {
    core: {
      limit: number;
      remaining: number;
      reset: number;
      used: number;
    };
    search: {
      limit: number;
      remaining: number;
      reset: number;
      used: number;
    };
    [key: string]: any;
  };
}

export default function RateLimitIndicator() {
  const [rateLimit, setRateLimit] = useState<RateLimitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const { theme } = useTheme();

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

    // Refresh rate limit data every 2 minutes
    const intervalId = setInterval(fetchRateLimit, 120000);

    return () => clearInterval(intervalId);
  }, []);

  // Format reset time
  const formatResetTime = (timestamp: number) => {
    const resetDate = new Date(timestamp * 1000);
    return resetDate.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className='fixed bottom-8 left-8 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 text-sm shadow-lg backdrop-blur-md z-50'>
        <div className='flex items-center gap-2'>
          <div className='relative'>
            <div className='animate-spin h-4 w-4 border-2 border-[var(--primary)] rounded-full border-t-transparent'></div>
            <div className='absolute inset-0 m-auto w-1 h-1 bg-[var(--primary)] rounded-full'></div>
          </div>
          <span className='text-[var(--text-secondary)]'>
            Checking API quota...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='fixed bottom-8 left-8 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 text-sm shadow-lg backdrop-blur-md z-50 text-red-400'>
        <div className='flex items-center gap-2'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-4 w-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          {error}
        </div>
      </div>
    );
  }

  if (!rateLimit) {
    return null;
  }

  // Calculate quota status
  const isLowQuota = rateLimit.remaining < 20;
  const quotaPercentage = Math.round(
    (rateLimit.remaining / rateLimit.limit) * 100
  );

  // Determine token source message
  let tokenMessage = 'No token found. Limited to 60 requests/hour';
  if (rateLimit.tokenSource === 'environment') {
    tokenMessage = 'Using server-side token (5,000 requests/hour)';
  } else if (rateLimit.tokenSource === 'client') {
    tokenMessage = 'Using your personal token (5,000 requests/hour)';
  }

  return (
    <div className='fixed bottom-8 left-8 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 text-sm shadow-lg backdrop-blur-sm z-50 max-w-xs'>
      <div
        className='font-bold mb-2 flex items-center gap-2 cursor-pointer'
        onClick={() => setExpanded(!expanded)}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            isLowQuota ? 'bg-red-500' : 'bg-green-500'
          }`}
        ></div>
        <span className='text-[var(--text-primary)]'>GitHub API Quota</span>
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
          className={`ml-auto transition-transform text-[var(--text-secondary)] ${
            expanded ? 'rotate-180' : ''
          }`}
        >
          <polyline points='6 9 12 15 18 9'></polyline>
        </svg>
      </div>

      {expanded && (
        <>
          <div className='mb-3 p-2 bg-[var(--background)] rounded'>
            <div className='grid grid-cols-2 gap-x-4 gap-y-1'>
              <div className='text-[var(--text-secondary)]'>Remaining:</div>
              <div className='font-mono font-bold text-[var(--text-primary)]'>
                {rateLimit.remaining} / {rateLimit.limit}
              </div>

              <div className='text-[var(--text-secondary)]'>Used:</div>
              <div className='font-mono text-[var(--text-primary)]'>
                {rateLimit.used} (
                {Math.round((rateLimit.used / rateLimit.limit) * 100)}%)
              </div>

              <div className='text-[var(--text-secondary)]'>Reset at:</div>
              <div className='font-mono text-[var(--text-primary)]'>
                {formatResetTime(rateLimit.reset)}
              </div>
            </div>

            <div className='mt-3'>
              <div className='h-2 bg-[var(--card-border)] rounded-full overflow-hidden'>
                <div
                  className={`h-full ${
                    isLowQuota ? 'bg-red-500' : 'bg-[var(--primary)]'
                  }`}
                  style={{
                    width: `${(rateLimit.remaining / rateLimit.limit) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Resource specific limits */}
          {rateLimit.resources && (
            <div className='mb-3 p-2 bg-[var(--background)] rounded'>
              <div className='font-medium mb-1 text-[var(--text-primary)]'>
                Resource Limits
              </div>
              <div className='grid grid-cols-2 gap-x-4 gap-y-1'>
                <div className='text-[var(--text-secondary)]'>Search API:</div>
                <div className='font-mono text-[var(--text-primary)]'>
                  {rateLimit.resources.search.remaining} /{' '}
                  {rateLimit.resources.search.limit}
                </div>

                <div className='text-[var(--text-secondary)]'>GraphQL API:</div>
                <div className='font-mono text-[var(--text-primary)]'>
                  {rateLimit.resources.graphql?.remaining || 0} /{' '}
                  {rateLimit.resources.graphql?.limit || 0}
                </div>
              </div>
            </div>
          )}

          <div className='mt-2 text-xs text-[var(--text-secondary)]'>
            {tokenMessage}
          </div>
        </>
      )}
    </div>
  );
}
