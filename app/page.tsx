// app/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import RateLimitIndicator from '@/components/RateLimitIndicator';

export default function HomePage() {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsSubmitting(true);
      router.push(`/${username.trim()}`);
    }
  };

  return (
    <div className='min-h-screen flex flex-col'>
      {/* Old UI - Top Section with Form */}
      <div className='w-full px-4 md:px-0 py-20 flex flex-col items-center justify-center relative'>
        <div className='text-center mb-8'>
          <div className='flex items-center justify-center gap-3 mb-6'>
            <Image
              alt='logo'
              src='/githubfoliologo.png'
              width={40}
              height={40}
            />
            <h1 className='text-3xl font-bold font-mono'>GitHubFolio</h1>
          </div>

          <h2 className='text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[#8976EA]'>
            Beautiful Developer <br />
            Portfolio in Seconds
          </h2>

          <p className='text-lg text-gray-400 max-w-md mx-auto'>
            Turn your GitHub profile into a stunning minimal portfolio website
            with just your username.
          </p>

          {/* Social Media Icons - Added here */}
          <div className='flex justify-center mt-6 space-x-4'>
            <a
              href='https://x.com/Harshrwt27'
              target='_blank'
              rel='noopener noreferrer'
              className='bg-[var(--card-bg)] hover:bg-[var(--primary)] hover:text-white border border-[var(--card-border)] w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z'></path>
              </svg>
            </a>
            <a
              href='https://github.com/Harshrawat27/githubfolio'
              target='_blank'
              rel='noopener noreferrer'
              className='bg-[var(--card-bg)] hover:bg-[var(--primary)] hover:text-white border border-[var(--card-border)] w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22'></path>
              </svg>
            </a>
          </div>

          {/* Section marker */}
          <div className='absolute -right-4 top-0 text-xs font-mono text-[var(--text-secondary)] opacity-70'>
            #01
          </div>
        </div>

        <div className='w-full max-w-md mb-8'>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500'>
                github.com/
              </div>
              <input
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder='username'
                className='w-full bg-[#111111] border border-[#222222] text-white pl-[106px] pr-4 py-3.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8976EA] focus:border-transparent transition-all'
                required
              />
            </div>

            <button
              type='submit'
              disabled={isSubmitting || !username.trim()}
              className='bg-[#8976EA] hover:bg-[#7D6BD0] text-white p-3.5 rounded-lg transition-colors disabled:opacity-50 font-medium'
            >
              {isSubmitting ? (
                <span className='flex items-center justify-center'>
                  <svg
                    className='animate-spin h-5 w-5 mr-3'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  Creating Portfolio...
                </span>
              ) : (
                'Create My Portfolio'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* New UI - Feature Cards Section with modern styling */}
      <div className='w-full px-4 pb-10 relative'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mx-auto'>
          <div className='card group cursor-default border border-[var(--card-border)] bg-[var(--card-bg)] rounded-lg p-5'>
            <div className='text-[#8976EA] mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-8 w-8'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                />
              </svg>
            </div>
            <h3 className='text-lg font-bold mb-2'>Instant Portfolio</h3>
            <p className='text-[var(--text-secondary)] text-sm'>
              Create your professional developer portfolio in seconds with just
              your GitHub username.
            </p>
          </div>

          <div className='card group cursor-default border border-[var(--card-border)] bg-[var(--card-bg)] rounded-lg p-5'>
            <div className='text-[#8976EA] mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-8 w-8'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z'
                />
              </svg>
            </div>
            <h3 className='text-lg font-bold mb-2'>Showcase Projects</h3>
            <p className='text-[var(--text-secondary)] text-sm'>
              Highlight your best work with beautiful project cards
              automatically pulled from your repositories.
            </p>
          </div>

          <div className='card group cursor-default border border-[var(--card-border)] bg-[var(--card-bg)] rounded-lg p-5'>
            <div className='text-[#8976EA] mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-8 w-8'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
                />
              </svg>
            </div>
            <h3 className='text-lg font-bold mb-2'>Shareable Link</h3>
            <p className='text-[var(--text-secondary)] text-sm'>
              Share your portfolio with a simple, easy-to-remember link that
              updates automatically with your GitHub activity.
            </p>
          </div>
        </div>

        <div className='mt-6 text-center'>
          <p className='text-[var(--text-secondary)] text-sm mb-2'>
            Visit your portfolio anytime at
          </p>
          <div className='font-mono inline-block bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-4 py-2'>
            githubfolio.com/<span className='text-[#8976EA]'>username</span>
          </div>
        </div>
      </div>

      <a
        href='https://www.producthunt.com/posts/githubfolio?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-githubfolio'
        target='_blank'
        rel='noopener noreferrer'
      >
        <img
          className='fixed bottom-4 left-4'
          src='https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=950701&theme=neutral&t=1744092436991'
          alt='GitHubFolio - GitHub&#0032;profile&#0032;to&#0032;portfolio&#0032;website&#0032;in&#0032;3&#0032;seconds&#0046;&#0032;🚀 | Product Hunt'
          width='250'
          height='54'
        />
      </a>

      {/* GitHub API Rate Limit Indicator */}
      {/* <RateLimitIndicator /> */}
    </div>
  );
}
{
  /* Date indicator */
}
{
  /* <div className='absolute top-4 right-4 text-xs font-mono text-[var(--text-secondary)]'>
            {new Date()
              .toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
              .toUpperCase()}
          </div> */
}
