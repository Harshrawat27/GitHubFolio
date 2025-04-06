// app/api/github/rate-limit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createGitHubHeaders } from '@/lib/githubToken';

export async function GET(request: NextRequest) {
  try {
    // Get token from query parameter if provided (from localStorage on client)
    const { searchParams } = new URL(request.url);
    const clientToken = searchParams.get('token');

    // Check if we have a token from environment variable
    const hasEnvToken = !!process.env.GITHUB_ACCESS_TOKEN;
    const hasPublicEnvToken = !!process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN;

    // Create headers for API request - this function will prioritize server token
    const headers = createGitHubHeaders();

    // Fetch rate limit using the headers
    const response = await fetch('https://api.github.com/rate_limit', {
      headers,
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    // Determine token source:
    // - If rate limit > 60, we're using an authenticated token
    // - If hasEnvToken is true and we're not using a client token or public env token,
    //   then we must be using the server token
    let tokenSource = null;
    if (data.rate.limit > 60) {
      // We're using some kind of token
      if (hasEnvToken && (!clientToken || !hasPublicEnvToken)) {
        tokenSource = 'environment';
      } else if (clientToken) {
        tokenSource = 'client';
      } else if (hasPublicEnvToken) {
        tokenSource = 'environment';
      }
    }

    return NextResponse.json({
      // Main rate limit info
      rate: data.rate,
      remaining: data.rate.remaining,
      limit: data.rate.limit,
      reset: data.rate.reset,
      used: data.rate.used,

      // Additional info
      hasEnvToken,
      hasClientToken: !!clientToken,
      tokenSource,

      // Resources for detailed limits
      resources: data.resources,
    });
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return NextResponse.json(
      { error: 'Failed to check GitHub rate limit' },
      { status: 500 }
    );
  }
}
