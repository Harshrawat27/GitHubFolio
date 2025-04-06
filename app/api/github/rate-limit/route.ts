// app/api/github/rate-limit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createGitHubHeaders } from '@/lib/githubToken';

export async function GET(request: NextRequest) {
  try {
    // Always prioritize environment variable token on the server
    const headers = createGitHubHeaders();

    // Check if we have a token from environment variable
    const hasEnvToken = !!process.env.GITHUB_ACCESS_TOKEN;

    // Get token from query parameter if provided (from localStorage on client)
    const { searchParams } = new URL(request.url);
    const clientToken = searchParams.get('token');

    // Fetch rate limit using the headers
    const response = await fetch('https://api.github.com/rate_limit', {
      headers,
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      // Main rate limit info
      remaining: data.rate.remaining,
      limit: data.rate.limit,
      reset: data.rate.reset,
      used: data.rate.used,

      // Additional info
      hasEnvToken,
      hasClientToken: !!clientToken,
      tokenSource: hasEnvToken ? 'environment' : clientToken ? 'client' : null,

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
