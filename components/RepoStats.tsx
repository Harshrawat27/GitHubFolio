'use client';

import { useState, useMemo } from 'react';
import { Repository, LanguageStat } from '@/types';
import { StarIcon, GitForkIcon } from '@/components/Icons';
import { createGitHubHeaders } from '@/lib/githubToken';

interface RepoStatsProps {
  repos: Repository[];
}

export default function RepoStats({ repos }: RepoStatsProps) {
  const [sortBy, setSortBy] = useState<'stars' | 'updated'>('stars');

  // Get total stars across all repos
  const totalStars = useMemo(() => {
    return repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  }, [repos]);

  // Get total forks across all repos
  const totalForks = useMemo(() => {
    return repos.reduce((sum, repo) => sum + repo.forks_count, 0);
  }, [repos]);
  // Calculate language statistics
  const languageStats = useMemo(() => {
    const stats: Record<string, number> = {};
    repos.forEach((repo) => {
      if (repo.language) {
        stats[repo.language] = (stats[repo.language] || 0) + 1;
      }
    });

    // Convert to array and sort by count
    const languageArray: LanguageStat[] = Object.keys(stats).map(
      (language) => ({
        language,
        count: stats[language],
        color: getLanguageColor(language),
      })
    );

    return languageArray.sort((a, b) => b.count - a.count).slice(0, 5);
  }, [repos]);

  // Get sorted repositories
  const sortedRepos = useMemo(() => {
    return [...repos]
      .sort((a, b) => {
        if (sortBy === 'stars') {
          return b.stargazers_count - a.stargazers_count;
        } else {
          return (
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
        }
      })
      .slice(0, 5);
  }, [repos, sortBy]);

  // Rest of the component...

  return (
    <div className='card'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-bold flex items-center gap-2'>
          <span className='w-1 h-6 bg-[#8976EA] rounded-md'></span>
          Repository Stats
        </h2>
        <div className='flex gap-2'>
          <button
            className={`px-3 py-1 text-xs rounded-md border transition-colors ${
              sortBy === 'stars'
                ? 'bg-[#8976EA] text-white border-[#8976EA]'
                : 'bg-[#191919] text-gray-300 border-[#222222] hover:border-[#8976EA] hover:text-white'
            }`}
            onClick={() => setSortBy('stars')}
          >
            Most Starred
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-md border transition-colors ${
              sortBy === 'updated'
                ? 'bg-[#8976EA] text-white border-[#8976EA]'
                : 'bg-[#191919] text-gray-300 border-[#222222] hover:border-[#8976EA] hover:text-white'
            }`}
            onClick={() => setSortBy('updated')}
          >
            Recently Updated
          </button>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4 mb-6'>
        <div className='p-4 bg-[#191919] rounded-lg border border-[#222222]'>
          <div className='flex items-center gap-2'>
            <StarIcon className='h-5 w-5 text-yellow-500' />
            <span className='text-xl font-bold'>{totalStars}</span>
          </div>
          <div className='text-sm text-gray-400'>Total Stars</div>
        </div>

        <div className='p-4 bg-[#191919] rounded-lg border border-[#222222]'>
          <div className='flex items-center gap-2'>
            <GitForkIcon className='h-5 w-5 text-gray-400' />
            <span className='text-xl font-bold'>{totalForks}</span>
          </div>
          <div className='text-sm text-gray-400'>Total Forks</div>
        </div>
      </div>

      <div className='mb-6'>
        <h3 className='text-lg font-medium mb-3 text-gray-200'>
          Top Languages
        </h3>
        <div className='flex flex-wrap gap-2'>
          {languageStats.map(({ language, count, color }) => (
            <div
              key={language}
              className='flex items-center gap-2 px-3 py-1 bg-[#191919] border border-[#222222] rounded-full'
            >
              <div
                className='w-3 h-3 rounded-full'
                style={{ backgroundColor: color || '#ccc' }}
              />
              <span className='text-sm'>{language}</span>
              <span className='text-xs text-gray-500'>({count})</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className='text-lg font-medium mb-3 text-gray-200'>
          {sortBy === 'stars' ? 'Top Repositories' : 'Recently Updated'}
        </h3>
        <ul className='space-y-3'>
          {sortedRepos.map((repo) => (
            <li
              key={repo.id}
              className='border-b border-[#222222] pb-3 last:border-0'
            >
              <a
                href={repo.html_url}
                target='_blank'
                rel='noopener noreferrer'
                className='font-medium text-[#8976EA] hover:text-[#A595F0] transition-colors'
              >
                {repo.name}
              </a>
              {repo.description && (
                <p className='text-sm text-gray-400 line-clamp-2 mt-1'>
                  {repo.description}
                </p>
              )}
              <div className='flex items-center gap-4 mt-2'>
                <div className='flex items-center gap-1 text-sm'>
                  <StarIcon className='h-4 w-4 text-yellow-500' />
                  <span className='text-gray-300'>{repo.stargazers_count}</span>
                </div>
                {repo.language && (
                  <div className='flex items-center gap-1 text-sm'>
                    <div
                      className='w-2 h-2 rounded-full'
                      style={{
                        backgroundColor:
                          getLanguageColor(repo.language) || '#ccc',
                      }}
                    />
                    <span className='text-gray-400'>{repo.language}</span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
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
