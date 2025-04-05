'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import BottomNavigation from '@/components/BottomNavigation';
import { Repository } from '@/types';

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
        // Create headers with token if available
        const headers: HeadersInit = {};
        if (token) {
          headers.Authorization = `token ${token}`;
        }

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
        <div className='w-16 h-16 relative'>
          <div className='absolute inset-0 rounded-full border-2 border-[#8976EA] border-t-transparent animate-spin'></div>
        </div>
        <p className='mt-4 text-gray-400'>Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center h-screen text-center px-4'>
        <div className='w-16 h-16 bg-[#111111] rounded-full flex items-center justify-center mb-4'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-8 w-8 text-[#8976EA]'
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
        <p className='text-gray-400 mb-6'>{error}</p>
        <Link
          href={`/${username}`}
          className='px-6 py-2 bg-[#8976EA] rounded-full text-white'
        >
          Back to Profile
        </Link>
      </div>
    );
  }

  return (
    <div className='flex flex-col pb-32'>
      {/* Header */}
      <div className='flex justify-between items-center mb-8'>
        <Link
          href={`/${username}`}
          className='text-gray-400 hover:text-white transition-colors flex items-center gap-2'
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

        <h1 className='text-xl font-bold'>All Projects</h1>
      </div>

      {/* Search and filters */}
      <div className='mb-6 space-y-4'>
        <div className='relative'>
          <input
            type='text'
            placeholder='Search repositories...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full bg-[#111111] border border-[#222222] rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8976EA] focus:border-transparent'
          />
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5 text-gray-400 absolute left-3 top-2.5'
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
          <div className='flex rounded-lg overflow-hidden border border-[#222222]'>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm ${
                filter === 'all'
                  ? 'bg-[#8976EA] text-white'
                  : 'bg-[#111111] text-gray-300 hover:bg-[#191919]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('source')}
              className={`px-3 py-1.5 text-sm ${
                filter === 'source'
                  ? 'bg-[#8976EA] text-white'
                  : 'bg-[#111111] text-gray-300 hover:bg-[#191919]'
              }`}
            >
              Source
            </button>
            <button
              onClick={() => setFilter('forked')}
              className={`px-3 py-1.5 text-sm ${
                filter === 'forked'
                  ? 'bg-[#8976EA] text-white'
                  : 'bg-[#111111] text-gray-300 hover:bg-[#191919]'
              }`}
            >
              Forked
            </button>
          </div>

          <div className='flex rounded-lg overflow-hidden border border-[#222222]'>
            <button
              onClick={() => setSortBy('stars')}
              className={`px-3 py-1.5 text-sm ${
                sortBy === 'stars'
                  ? 'bg-[#8976EA] text-white'
                  : 'bg-[#111111] text-gray-300 hover:bg-[#191919]'
              }`}
            >
              Stars
            </button>
            <button
              onClick={() => setSortBy('updated')}
              className={`px-3 py-1.5 text-sm ${
                sortBy === 'updated'
                  ? 'bg-[#8976EA] text-white'
                  : 'bg-[#111111] text-gray-300 hover:bg-[#191919]'
              }`}
            >
              Updated
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-3 py-1.5 text-sm ${
                sortBy === 'name'
                  ? 'bg-[#8976EA] text-white'
                  : 'bg-[#111111] text-gray-300 hover:bg-[#191919]'
              }`}
            >
              Name
            </button>
          </div>
        </div>
      </div>

      {/* Repository list */}
      {filteredRepos.length === 0 ? (
        <div className='bg-[#111111] border border-[#222222] rounded-lg p-12 text-center'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-16 w-16 mx-auto text-gray-700 mb-4'
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
          <p className='text-gray-400'>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4'>
          {filteredRepos.map((repo) => (
            <Link
              key={repo.id}
              href={`/${username}/projects/${repo.name}`}
              className='bg-[#111111] border border-[#222222] rounded-lg p-5 hover:border-[#8976EA] transition-all duration-300'
            >
              <div className='flex justify-between items-start'>
                <div>
                  <h2 className='text-lg font-bold mb-1 hover:text-[#8976EA] transition-colors'>
                    {repo.name}
                  </h2>
                  {repo.description && (
                    <p className='text-gray-400 text-sm mb-3'>
                      {repo.description}
                    </p>
                  )}
                </div>

                {repo.fork && (
                  <span className='bg-[#191919] text-xs px-2 py-1 rounded text-gray-400'>
                    Forked
                  </span>
                )}
              </div>

              <div className='flex flex-wrap items-center gap-4 mt-2'>
                {repo.language && (
                  <div className='flex items-center gap-1.5'>
                    <span
                      className='h-3 w-3 rounded-full'
                      style={{
                        backgroundColor: getLanguageColor(repo.language),
                      }}
                    ></span>
                    <span className='text-xs text-gray-300'>
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
                    <span className='text-xs text-gray-300'>
                      {repo.stargazers_count}
                    </span>
                  </div>
                )}

                {repo.forks_count > 0 && (
                  <div className='flex items-center gap-1.5'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4 text-gray-400'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <span className='text-xs text-gray-300'>
                      {repo.forks_count}
                    </span>
                  </div>
                )}

                <div className='flex items-center gap-1.5 ml-auto'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 text-gray-400'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='text-xs text-gray-400'>
                    Updated {formatDate(repo.updated_at)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation username={username} />
    </div>
  );
}
