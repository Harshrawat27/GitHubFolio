'use client';

import { useState, useEffect } from 'react';
import { Repository } from '@/types';
import { StarIcon, GitForkIcon } from '@/components/Icons';
import { createGitHubHeaders } from '@/lib/githubToken';

interface PinnedReposProps {
  username: string;
  repos: Repository[];
  token: string | null;
}

export default function PinnedRepos({
  username,
  repos,
  token,
}: PinnedReposProps) {
  const [pinnedRepos, setPinnedRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPinnedRepos = async () => {
      setLoading(true);
      setError('');

      try {
        // Since GitHub API doesn't have an endpoint for pinned repositories,
        // we'll use a combination of approaches to approximate them:

        // Use createGitHubHeaders to get headers with the appropriate token
        const headers = createGitHubHeaders();

        // 1. Use the GraphQL API if a token is available (more accurate)
        // Get token from environment or client
        const activeToken = process.env.GITHUB_ACCESS_TOKEN || token;

        if (activeToken) {
          try {
            const response = await fetch('https://api.github.com/graphql', {
              method: 'POST',
              headers: {
                Authorization: `bearer ${activeToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                query: `{
                  user(login: "${username}") {
                    pinnedItems(first: 6, types: REPOSITORY) {
                      nodes {
                        ... on Repository {
                          name
                        }
                      }
                    }
                  }
                }`,
              }),
            });

            const result = await response.json();

            if (result.data?.user?.pinnedItems?.nodes) {
              const graphqlPinned = result.data.user.pinnedItems.nodes;

              // Find the corresponding full repository data from our repos list
              const pinnedWithFullData = graphqlPinned
                .map((pinnedItem: any) => {
                  const fullRepo = repos.find(
                    (repo) => repo.name === pinnedItem.name
                  );
                  return fullRepo || null;
                })
                .filter(Boolean);

              if (pinnedWithFullData.length > 0) {
                setPinnedRepos(pinnedWithFullData);
                setLoading(false);
                return;
              }
            }
          } catch (error) {
            console.error('GraphQL error:', error);
            // Fall back to heuristic method
          }
        }

        // 2. Fallback: Heuristically determine likely pinned repos
        // Sort by a combination of stars, forks, and recency
        const sortedRepos = [...repos].sort((a, b) => {
          // Calculate a score based on stars, forks, and recency
          const scoreA =
            a.stargazers_count * 3 +
            a.forks_count * 2 +
            new Date(a.pushed_at).getTime() / 1000000000;
          const scoreB =
            b.stargazers_count * 3 +
            b.forks_count * 2 +
            new Date(b.pushed_at).getTime() / 1000000000;
          return scoreB - scoreA;
        });

        // Take the top 6 non-fork repositories
        const topRepos = sortedRepos.filter((repo) => !repo.fork).slice(0, 6);

        setPinnedRepos(topRepos);
      } catch (error) {
        console.error('Error fetching pinned repositories:', error);
        setError('Failed to load pinned repositories');
      } finally {
        setLoading(false);
      }
    };

    if (username && repos.length > 0) {
      fetchPinnedRepos();
    }
  }, [username, repos, token]);

  // Rest of the component...

  if (pinnedRepos.length === 0 && !loading) {
    return null;
  }

  return (
    <div className='card'>
      <h2 className='text-xl font-bold mb-6 flex items-center gap-2'>
        <span className='w-1 h-6 bg-[#8976EA] rounded-md'></span>
        {token ? 'Pinned Repositories' : 'Top Repositories'}
      </h2>

      {loading ? (
        <div className='py-6 flex items-center justify-center'>
          <div className='animate-spin h-8 w-8 border-2 border-[#8976EA] rounded-full border-t-transparent'></div>
        </div>
      ) : error ? (
        <div className='text-red-400 py-4'>{error}</div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {pinnedRepos.map((repo) => (
            <div
              key={repo.id}
              className='bg-[#191919] rounded-lg border border-[#222222] p-4 flex flex-col hover:border-[#8976EA] hover:border-opacity-50 transition-all duration-300'
            >
              <a
                href={repo.html_url}
                target='_blank'
                rel='noopener noreferrer'
                className='font-medium text-[#8976EA] hover:text-[#A595F0] transition-colors font-mono'
              >
                {repo.name}
              </a>

              {repo.description && (
                <p className='mt-2 text-sm text-gray-400 line-clamp-2 flex-grow'>
                  {repo.description}
                </p>
              )}

              <div className='mt-4 flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div className='flex items-center gap-1'>
                    <StarIcon className='h-4 w-4 text-yellow-500' />
                    <span className='text-sm text-gray-300'>
                      {repo.stargazers_count}
                    </span>
                  </div>

                  <div className='flex items-center gap-1'>
                    <GitForkIcon className='h-4 w-4 text-gray-500' />
                    <span className='text-sm text-gray-300'>
                      {repo.forks_count}
                    </span>
                  </div>
                </div>

                {repo.language && (
                  <div className='flex items-center gap-1'>
                    <div
                      className='w-3 h-3 rounded-full'
                      style={{
                        backgroundColor: getLanguageColor(repo.language),
                      }}
                    />
                    <span className='text-xs text-gray-400'>
                      {repo.language}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to get color for language
function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Python: '#3572A5',
    Java: '#b07219',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Go: '#00ADD8',
    Rust: '#dea584',
    C: '#555555',
    'C++': '#f34b7d',
    'C#': '#178600',
    Swift: '#ffac45',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    Shell: '#89e051',
    Vue: '#41b883',
    // Add more colors as needed
  };

  return colors[language] || '#8b949e';
}
