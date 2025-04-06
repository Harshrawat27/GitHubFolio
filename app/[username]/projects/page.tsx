// app/[username]/projects/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Repository } from '@/types';
import { createGitHubHeaders } from '@/lib/githubToken';
import SideNav from '@/components/SideNav';

export default function ProjectsPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [repos, setRepos] = useState<Repository[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'forked' | 'source'>('all');
  const [sortBy, setSortBy] = useState<'stars' | 'updated' | 'name'>('stars');
  const [searchQuery, setSearchQuery] = useState('');

  // Check for token in localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('github_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch repositories
  useEffect(() => {
    const fetchRepos = async () => {
      if (!username) return;

      setLoading(true);
      setError('');

      try {
        // Use createGitHubHeaders to get headers with the appropriate token
        const headers = createGitHubHeaders();

        // Fetch all repositories
        const reposResponse = await fetch(
          `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`,
          { headers }
        );

        if (!reposResponse.ok) {
          throw new Error(
            `Failed to fetch repositories: ${reposResponse.status}`
          );
        }

        const reposData = await reposResponse.json();
        setRepos(reposData);
      } catch (error) {
        if (error instanceof Error) {
          setError(`Error: ${error.message}`);
        } else {
          setError('Error fetching repositories');
        }
        setRepos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [username, token]);

  // Filter and sort repositories
  useEffect(() => {
    let result = [...repos];

    // Apply filter
    if (filter === 'forked') {
      result = result.filter((repo) => repo.fork);
    } else if (filter === 'source') {
      result = result.filter((repo) => !repo.fork);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (repo) =>
          repo.name.toLowerCase().includes(query) ||
          (repo.description && repo.description.toLowerCase().includes(query))
      );
    }

    // Apply sort
    if (sortBy === 'stars') {
      result.sort((a, b) => b.stargazers_count - a.stargazers_count);
    } else if (sortBy === 'updated') {
      result.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredRepos(result);
  }, [repos, filter, sortBy, searchQuery]);

  // Helper function to get color for language
  const getLanguageColor = (language: string | null): string => {
    if (!language) return '#8b949e';

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
    };

    return colors[language] || '#8b949e';
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <div className='relative w-16 h-16'>
          <div className='absolute inset-0 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin'></div>
          <div className='absolute inset-0 m-auto w-2 h-2 bg-[var(--primary)] rounded-full'></div>
        </div>
        <h2 className='text-xl font-bold mt-8 mb-2 font-mono'>
          Loading projects...
        </h2>
        <p className='text-[var(--text-secondary)] max-w-md text-center'>
          We're fetching all repositories from GitHub.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center h-screen text-center px-4'>
        <div className='w-16 h-16 bg-[var(--card-bg)] flex items-center justify-center rounded-full border border-[var(--card-border)] mb-6'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-8 w-8 text-[var(--primary)]'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
            />
          </svg>
        </div>
        <h2 className='text-2xl font-bold mb-2'>Error</h2>
        <p className='text-[var(--text-secondary)] mb-6'>{error}</p>
        <Link
          href={`/${username}`}
          className='px-6 py-2 bg-[var(--primary)] rounded-full text-white'
        >
          Back to Profile
        </Link>
      </div>
    );
  }

  return (
    <>
      <SideNav username={username} />

      <div className='flex flex-col pb-32 relative'>
        {/* Date indicator */}
        <div className='date-marker top-8 right-0'>
          {new Date().toISOString().split('T')[0]}
        </div>

        {/* Header */}
        <div className='flex justify-between items-center mb-8'>
          <Link
            href={`/${username}`}
            className='text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
                clipRule='evenodd'
              />
            </svg>
            Back to profile
          </Link>

          <h1 className='text-xl font-bold title-gradient'>All Projects</h1>
        </div>

        {/* Search and filters */}
        <div className='mb-8 space-y-4'>
          <div className='relative'>
            <input
              type='text'
              placeholder='Search repositories...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all'
            />
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 text-[var(--text-secondary)] absolute left-3 top-3.5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>

          <div className='flex flex-wrap gap-3'>
            <div className='flex rounded-lg overflow-hidden border border-[var(--card-border)]'>
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-sm ${
                  filter === 'all'
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--background)]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('source')}
                className={`px-3 py-1.5 text-sm ${
                  filter === 'source'
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--background)]'
                }`}
              >
                Source
              </button>
              <button
                onClick={() => setFilter('forked')}
                className={`px-3 py-1.5 text-sm ${
                  filter === 'forked'
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--background)]'
                }`}
              >
                Forked
              </button>
            </div>

            <div className='flex rounded-lg overflow-hidden border border-[var(--card-border)]'>
              <button
                onClick={() => setSortBy('stars')}
                className={`px-3 py-1.5 text-sm ${
                  sortBy === 'stars'
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--background)]'
                }`}
              >
                Stars
              </button>
              <button
                onClick={() => setSortBy('updated')}
                className={`px-3 py-1.5 text-sm ${
                  sortBy === 'updated'
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--background)]'
                }`}
              >
                Updated
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-3 py-1.5 text-sm ${
                  sortBy === 'name'
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--background)]'
                }`}
              >
                Name
              </button>
            </div>
          </div>
        </div>

        {/* Repository list */}
        {filteredRepos.length === 0 ? (
          <div className='card text-center py-12'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-16 w-16 mx-auto text-[var(--text-secondary)] opacity-50 mb-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'
              />
            </svg>
            <h2 className='text-xl font-bold mb-2'>No repositories found</h2>
            <p className='text-[var(--text-secondary)]'>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4'>
            {filteredRepos.map((repo, index) => (
              <Link
                key={repo.id}
                href={`/${username}/projects/${repo.name}`}
                className='card hover:scale-[1.01] group relative'
              >
                {/* Repo number */}
                <div className='absolute top-4 right-4 text-xs font-mono text-[var(--text-secondary)] opacity-70'>
                  #{String(index + 1).padStart(2, '0')}
                </div>

                <div className='flex justify-between items-start'>
                  <div>
                    <h2 className='text-lg font-bold mb-1 group-hover:text-[var(--primary)] transition-colors flex items-center gap-2'>
                      {repo.language && (
                        <span
                          className='h-3 w-3 rounded-full inline-block'
                          style={{
                            backgroundColor: getLanguageColor(repo.language),
                          }}
                        ></span>
                      )}
                      {repo.name}
                    </h2>

                    <div className='flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-1 mb-2'>
                      <span className='date-indicator'>
                        {new Date(repo.created_at)
                          .toLocaleDateString('en-US', {
                            month: 'short',
                            day: '2-digit',
                            year: 'numeric',
                          })
                          .toUpperCase()}
                      </span>

                      {repo.fork && (
                        <span className='bg-[var(--background)] px-2 py-0.5 rounded-full text-xs'>
                          Forked
                        </span>
                      )}

                      {/* Add Live Demo badge when homepage URL is available */}
                      {repo.homepage && (
                        <a
                          href={repo.homepage}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='bg-[var(--primary)] bg-opacity-10 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1 hover:bg-opacity-20 transition-colors'
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-3 w-3'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                          >
                            <path
                              fillRule='evenodd'
                              d='M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z'
                              clipRule='evenodd'
                            />
                          </svg>
                          Live Demo
                        </a>
                      )}
                    </div>

                    {repo.description && (
                      <p className='text-[var(--text-secondary)] text-sm mb-3'>
                        {repo.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className='flex flex-wrap items-center gap-4 mt-2'>
                  {repo.language && (
                    <div className='flex items-center gap-1.5'>
                      <span className='text-xs text-[var(--text-secondary)]'>
                        {repo.language}
                      </span>
                    </div>
                  )}

                  {repo.stargazers_count > 0 && (
                    <div className='flex items-center gap-1.5'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-4 w-4 text-yellow-400'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                      </svg>
                      <span className='text-xs text-[var(--text-secondary)]'>
                        {repo.stargazers_count}
                      </span>
                    </div>
                  )}

                  {repo.forks_count > 0 && (
                    <div className='flex items-center gap-1.5'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-4 w-4 text-[var(--text-secondary)]'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path
                          fillRule='evenodd'
                          d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                          clipRule='evenodd'
                        />
                      </svg>
                      <span className='text-xs text-[var(--text-secondary)]'>
                        {repo.forks_count}
                      </span>
                    </div>
                  )}

                  <div className='flex items-center gap-1.5 ml-auto'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4 text-[var(--text-secondary)]'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <span className='text-xs text-[var(--text-secondary)]'>
                      Updated {formatDate(repo.updated_at)}
                    </span>
                  </div>
                </div>

                {/* Project topics */}
                {repo.topics && repo.topics.length > 0 && (
                  <div className='flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--card-border)]'>
                    {repo.topics.slice(0, 3).map((topic) => (
                      <span
                        key={topic}
                        className='px-2 py-1 bg-[var(--background)] rounded-full text-xs text-[var(--text-secondary)]'
                      >
                        {topic}
                      </span>
                    ))}
                    {repo.topics.length > 3 && (
                      <span className='px-2 py-1 bg-[var(--background)] rounded-full text-xs text-[var(--text-secondary)]'>
                        +{repo.topics.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* View button */}
                <div className='absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity'>
                  <div className='px-3 py-1 bg-[var(--primary)] text-white rounded-md text-xs flex items-center gap-1'>
                    <span>View</span>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-3 w-3'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
