'use client';

import { useState, useEffect } from 'react';
import { Repository } from '@/types';
import { GitCommitIcon } from '@/components/Icons';
import Image from 'next/image';

interface CommitHistoryProps {
  repos: Repository[];
  username: string;
  token: string | null;
}

interface Commit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
  repository: string;
  repo_url: string;
}

export default function CommitHistory({
  repos,
  username,
  token,
}: CommitHistoryProps) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCommits = async () => {
      setLoading(true);
      setError('');

      try {
        if (repos.length === 0) {
          setCommits([]);
          setLoading(false);
          return;
        }

        // Create headers with token if available
        const headers: HeadersInit = {};
        if (token) {
          headers.Authorization = `token ${token}`;
        }

        // Create a combined approach - try to get some actual commits but also fallback to repo data
        const fallbackCommits: Commit[] = repos.slice(0, 5).map((repo) => ({
          sha: repo.id.toString(),
          html_url: repo.html_url,
          commit: {
            message: `Repository created: ${repo.name}`,
            author: {
              name: username,
              date: repo.created_at,
            },
          },
          author: null,
          repository: repo.name,
          repo_url: repo.html_url,
        }));

        // Get top repos by pushed date to increase chances of finding commits
        const topRepos = [...repos]
          .sort(
            (a, b) =>
              new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
          )
          .slice(0, 3);

        // Fetch commits for each repo
        const commitsPromises = topRepos.map(async (repo) => {
          try {
            // Try to get commits without author filter first to see if repo has any commits
            const response = await fetch(
              `https://api.github.com/repos/${repo.full_name}/commits?per_page=5`,
              {
                headers,
              }
            );

            if (!response.ok) {
              return [];
            }

            const data = await response.json();

            // Check if commits contain any from this user
            const userCommits = data.filter(
              (commit: any) =>
                commit.author?.login === username ||
                commit.commit?.author?.name === username
            );

            // Only attach repo information to the commits
            return userCommits.map((commit: any) => ({
              ...commit,
              repository: repo.name,
              repo_url: repo.html_url,
            }));
          } catch (error) {
            console.error(`Error fetching commits for ${repo.name}:`, error);
            return [];
          }
        });

        // Wait for all requests
        const commitsArrays = await Promise.all(commitsPromises);

        // Flatten and sort by date
        const allCommits = commitsArrays
          .flat()
          .sort(
            (a, b) =>
              new Date(b.commit.author.date).getTime() -
              new Date(a.commit.author.date).getTime()
          );

        if (allCommits.length > 0) {
          setCommits(allCommits.slice(0, 10));
        } else {
          // Use fallback if no real commits found
          setCommits(fallbackCommits);
        }
      } catch (error) {
        console.error('Failed to load commit history:', error);
        setError('Failed to load commit history');
      } finally {
        setLoading(false);
      }
    };

    if (repos.length > 0) {
      fetchCommits();
    } else {
      setLoading(false);
    }
  }, [repos, username, token]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className='bg-white p-6 rounded-lg shadow-md'>
      <h2 className='text-xl font-semibold mb-4'>Recent Activity</h2>

      {loading ? (
        <div className='h-64 flex items-center justify-center'>
          <div className='animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent'></div>
        </div>
      ) : error ? (
        <div className='text-red-500 py-4'>{error}</div>
      ) : commits.length === 0 ? (
        <div className='text-gray-500 py-4'>No recent activity found</div>
      ) : (
        <ul className='space-y-4 divide-y divide-gray-100'>
          {commits.map((commit) => (
            <li key={commit.sha} className='pt-4 first:pt-0'>
              <div className='flex items-start gap-3'>
                <div className='mt-1 flex-shrink-0'>
                  {commit.author?.avatar_url ? (
                    <Image
                      src={commit.author.avatar_url}
                      alt={commit.author.login}
                      width={24}
                      height={24}
                      className='rounded-full'
                    />
                  ) : (
                    <GitCommitIcon className='h-5 w-5 text-gray-500' />
                  )}
                </div>
                <div className='flex-grow min-w-0'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <a
                      href={commit.repo_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='font-medium text-blue-600 hover:underline'
                    >
                      {commit.repository}
                    </a>
                    <span className='text-gray-500'>•</span>
                    <span className='text-sm text-gray-500'>
                      {formatDate(commit.commit.author.date)}
                    </span>
                  </div>
                  <a
                    href={commit.html_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='mt-1 block text-sm text-gray-800 line-clamp-2 hover:text-blue-600'
                  >
                    {commit.commit.message}
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className='mt-4 text-sm text-gray-600'>
        {commits.length > 0 && (
          <p>Showing the most recent {commits.length} activities on GitHub.</p>
        )}
      </div>
    </div>
  );
}
