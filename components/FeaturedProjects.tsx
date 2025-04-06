// components/FeaturedProjects.tsx (Updated version)
import Link from 'next/link';
import { Repository } from '@/types';

interface FeaturedProjectsProps {
  repos: Repository[];
}

export default function FeaturedProjects({ repos }: FeaturedProjectsProps) {
  if (repos.length === 0) {
    // Instead of returning null, show a message
    return (
      <section className='w-full mb-16'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold'>Pinned Projects</h2>
        </div>

        <div className='bg-[#111111] border border-[#222222] rounded-lg p-8 text-center'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-12 w-12 mx-auto text-[#333333] mb-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
            />
          </svg>
          <h3 className='text-xl font-medium mb-2'>No pinned projects found</h3>
          <p className='text-gray-400 max-w-md mx-auto'>
            To showcase your best work here, pin repositories on your GitHub
            profile.
          </p>
          <a
            href='https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/pinning-items-to-your-profile'
            target='_blank'
            rel='noopener noreferrer'
            className='mt-4 inline-block text-[#8976EA] hover:underline'
          >
            Learn how to pin repositories
          </a>
        </div>
      </section>
    );
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
    <section className='w-full mb-16'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold'>Pinned Projects</h2>
        <Link
          href={`/${repos[0]?.owner?.login}/projects`}
          className='text-sm text-[#8976EA] hover:underline flex items-center'
        >
          View all
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-4 w-4 ml-1'
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path
              fillRule='evenodd'
              d='M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z'
              clipRule='evenodd'
            />
          </svg>
        </Link>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {repos.map((repo) => (
          <div
            key={repo.id}
            className='bg-[#111111] border border-[#222222] rounded-lg p-6 hover:border-[#8976EA] transition-all duration-300'
          >
            <h3 className='text-xl font-bold mb-2'>
              <Link
                href={`/${repo.owner.login}/projects/${repo.name}`}
                className='hover:text-[#8976EA] transition-colors'
              >
                {repo.name}
              </Link>
            </h3>

            <p className='text-gray-400 text-sm mb-4 line-clamp-2 min-h-[40px]'>
              {repo.description ||
                `A ${repo.language || 'code'} repository by ${
                  repo.owner.login
                }`}
            </p>

            <div className='flex items-center justify-between'>
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
                  <span className='text-sm text-gray-300'>
                    {repo.stargazers_count}
                  </span>
                </div>

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
                  <span className='text-sm text-gray-300'>
                    {repo.forks_count}
                  </span>
                </div>
              </div>

              {repo.language && (
                <div className='flex items-center gap-1.5'>
                  <span
                    className='h-3 w-3 rounded-full'
                    style={{ backgroundColor: getLanguageColor(repo.language) }}
                  ></span>
                  <span className='text-xs text-gray-400'>{repo.language}</span>
                </div>
              )}
            </div>

            {/* Project tags if available */}
            {repo.topics && repo.topics.length > 0 && (
              <div className='flex flex-wrap gap-2 mt-4'>
                {repo.topics.slice(0, 3).map((topic) => (
                  <span
                    key={topic}
                    className='px-2 py-1 bg-black rounded-full text-xs text-gray-400'
                  >
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
