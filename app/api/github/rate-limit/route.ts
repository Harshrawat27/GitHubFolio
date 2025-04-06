// app/api/github/rate-limit/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get token from query parameter if provided (from localStorage on client)
    const { searchParams } = new URL(request.url);
    const clientToken = searchParams.get('token');

    // Fallback to server token if no client token
    const serverToken = process.env.GITHUB_ACCESS_TOKEN;

    // Prepare to collect rate limit data
    let clientData = null;
    let serverData = null;

    // Check client token rate limit if available
    if (clientToken) {
      try {
        const clientResponse = await fetch(
          'https://api.github.com/rate_limit',
          {
            headers: {
              Authorization: `token ${clientToken}`,
            },
          }
        );

        if (clientResponse.ok) {
          clientData = await clientResponse.json();
        }
      } catch (error) {
        console.error('Error checking client token rate limit:', error);
      }
    }

    // Check server token rate limit if available and different from client token
    if (serverToken && serverToken !== clientToken) {
      try {
        const serverResponse = await fetch(
          'https://api.github.com/rate_limit',
          {
            headers: {
              Authorization: `token ${serverToken}`,
            },
          }
        );

        if (serverResponse.ok) {
          serverData = await serverResponse.json();
        }
      } catch (error) {
        console.error('Error checking server token rate limit:', error);
      }
    }

    // If no tokens worked, check unauthenticated rate limit
    if (!clientData && !serverData) {
      const unauthResponse = await fetch('https://api.github.com/rate_limit');

      if (!unauthResponse.ok) {
        throw new Error(`GitHub API error: ${unauthResponse.status}`);
      }

      const data = await unauthResponse.json();

      return NextResponse.json({
        remaining: data.rate.remaining,
        limit: data.rate.limit,
        reset: data.rate.reset,
        used: data.rate.used,
        hasToken: false,
        tokenSource: null,
        _debug: process.env.NODE_ENV === 'development' ? data : undefined,
      });
    }

    // Prepare response based on available data
    const response = {
      client: clientData
        ? {
            remaining: clientData.rate.remaining,
            limit: clientData.rate.limit,
            reset: clientData.rate.reset,
            used: clientData.rate.used,
          }
        : null,
      server: serverData
        ? {
            remaining: serverData.rate.remaining,
            limit: serverData.rate.limit,
            reset: serverData.rate.reset,
            used: serverData.rate.used,
          }
        : null,
      // Use client data as primary if available, otherwise server data
      remaining: clientData
        ? clientData.rate.remaining
        : serverData
        ? serverData.rate.remaining
        : 0,
      limit: clientData
        ? clientData.rate.limit
        : serverData
        ? serverData.rate.limit
        : 0,
      reset: clientData
        ? clientData.rate.reset
        : serverData
        ? serverData.rate.reset
        : 0,
      used: clientData
        ? clientData.rate.used
        : serverData
        ? serverData.rate.used
        : 0,
      hasClientToken: !!clientData,
      hasServerToken: !!serverData,
      effectiveTokenSource: clientData
        ? 'client'
        : serverData
        ? 'server'
        : null,
      totalLimit:
        (clientData ? clientData.rate.limit : 0) +
        (serverData ? serverData.rate.limit : 0),
      totalRemaining:
        (clientData ? clientData.rate.remaining : 0) +
        (serverData ? serverData.rate.remaining : 0),
      _debug:
        process.env.NODE_ENV === 'development'
          ? { clientData, serverData }
          : undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return NextResponse.json(
      { error: 'Failed to check GitHub rate limit' },
      { status: 500 }
    );
  }
}
