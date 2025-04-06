// components/FeaturedProjects.tsx
import Link from 'next/link';
import { Repository } from '@/types';

interface FeaturedProjectsProps {
  repos: Repository[];
}

export default function FeaturedProjects({ repos }: FeaturedProjectsProps) {
  if (repos.length === 0) {
    return null;
  }

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

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 relative'>
      {repos.map((repo, index) => (
        <div key={repo.id} className='card hover:scale-[1.02] group'>
          {/* Project number tag */}
          <div className='absolute top-4 right-4 text-xs font-mono text-[var(--text-secondary)] opacity-70'>
            #{String(index + 1).padStart(2, '0')}
          </div>

          <div className='mb-2'>
            <div className='flex items-center gap-2'>
              {repo.language && (
                <span
                  className='h-3 w-3 rounded-full'
                  style={{ backgroundColor: getLanguageColor(repo.language) }}
                ></span>
              )}
              <Link
                href={`/${repo.owner.login}/projects/${repo.name}`}
                className='font-bold text-xl hover:text-[var(--primary)] transition-colors'
              >
                {repo.name}
              </Link>
            </div>

            <div className='flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-1'>
              <span className='date-indicator'>
                {new Date(repo.created_at)
                  .toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  })
                  .toUpperCase()}
              </span>

              {repo.language && (
                <span className='bg-[var(--background)] px-2 py-0.5 rounded-full'>
                  {repo.language}
                </span>
              )}
            </div>
          </div>

          <p className='text-[var(--text-secondary)] text-sm mb-5 line-clamp-2 min-h-[40px]'>
            {repo.description ||
              `A ${repo.language || 'code'} repository by ${repo.owner.login}`}
          </p>

          <div className='flex items-center justify-between mt-auto'>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-1.5'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 text-yellow-400'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                </svg>
                <span className='text-sm text-[var(--text-secondary)]'>
                  {repo.stargazers_count}
                </span>
              </div>

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
                <span className='text-sm text-[var(--text-secondary)]'>
                  {repo.forks_count}
                </span>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <Link
                href={`/${repo.owner.login}/projects/${repo.name}`}
                className='text-[var(--primary)] text-sm flex items-center gap-1 relative overflow-hidden group-hover:underline'
              >
                <span>View Project</span>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 transform group-hover:translate-x-1 transition-transform'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </Link>

              {repo.homepage && (
                <a
                  href={repo.homepage}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-[var(--text-secondary)] hover:text-[var(--primary)] text-sm flex items-center gap-1 transition-colors'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span>Live Demo</span>
                </a>
              )}
            </div>
          </div>

          {/* Project tags if available */}
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
        </div>
      ))}

      {/* View all link */}
      {repos.length > 0 && (
        <div className='md:col-span-2 text-center mt-4'>
          <Link
            href={`/${repos[0]?.owner?.login}/projects`}
            className='inline-flex items-center justify-center px-4 py-2 border border-[var(--card-border)] rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition-colors group'
          >
            <span>View All Projects</span>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
