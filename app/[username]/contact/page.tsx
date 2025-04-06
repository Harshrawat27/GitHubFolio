// app/[username]/contact/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import SideNav from '@/components/SideNav';
import { GitHubUser } from '@/types';
import { createGitHubHeaders } from '@/lib/githubToken';

export default function ContactPage() {
  const params = useParams();
  const username = params.username as string;

  const [userData, setUserData] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);

  // Check for token in localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('github_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch GitHub profile data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!username) return;

      setLoading(true);
      setError('');

      try {
        // Use createGitHubHeaders to get headers with the appropriate token
        const headers = createGitHubHeaders();

        // Fetch user profile data
        const userResponse = await fetch(
          `https://api.github.com/users/${username}`,
          { headers }
        );

        if (!userResponse.ok) {
          throw new Error(`User not found (${userResponse.status})`);
        }

        const userData = await userResponse.json();
        setUserData(userData);
      } catch (error) {
        if (error instanceof Error) {
          setError(`Error: ${error.message}`);
        } else {
          setError('Error fetching user data');
        }
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username, token]);

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <div className='relative w-16 h-16'>
          <div className='absolute inset-0 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin'></div>
          <div className='absolute inset-0 m-auto w-2 h-2 bg-[var(--primary)] rounded-full'></div>
        </div>
        <h2 className='text-xl font-bold mt-8 mb-2 font-mono'>
          Loading contact info...
        </h2>
        <p className='text-[var(--text-secondary)] max-w-md text-center'>
          We're fetching contact information from GitHub.
        </p>
      </div>
    );
  }

  if (error || !userData) {
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
        <p className='text-[var(--text-secondary)] mb-6'>
          {error || "Couldn't load contact information"}
        </p>
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

      <div className='flex flex-col items-center pb-32 pt-12 relative'>
        {/* Date indicator */}
        <div className='date-marker top-8 right-0'>
          {new Date().toISOString().split('T')[0]}
        </div>

        {/* Header */}
        <div className='w-full flex justify-between items-center mb-12'>
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

          <h1 className='text-xl font-bold title-gradient'>Contact</h1>

          {/* Index marker */}
          <div className='text-xs font-mono text-[var(--text-secondary)] opacity-70'>
            #03
          </div>
        </div>

        {/* Profile overview */}
        <div className='flex flex-col items-center mb-16 relative'>
          <div className='w-32 h-32 rounded-full overflow-hidden border-2 border-[var(--primary)] p-1 mb-6 relative'>
            <Image
              src={userData.avatar_url}
              alt={userData.name || userData.login}
              fill
              className='rounded-full object-cover'
            />
            <div className='absolute -z-10 w-40 h-40 bg-[var(--primary)] opacity-20 blur-xl'></div>
          </div>

          <h2 className='text-3xl font-bold mb-1 title-gradient'>
            {userData.name || userData.login}
          </h2>
          <p className='text-[var(--text-secondary)] font-mono mb-4'>
            {userData.location || 'Developer'}
          </p>

          <div className='text-sm text-[var(--text-secondary)] max-w-md text-center mb-4'>
            {userData.bio ||
              `GitHub developer with ${userData.public_repos} public repositories.`}
          </div>

          <div className='flex gap-2'>
            <span className='px-3 py-1 bg-[var(--background)] text-[var(--text-secondary)] rounded-full text-xs font-mono'>
              @{userData.login}
            </span>

            {userData.twitter_username && (
              <a
                href={`https://twitter.com/${userData.twitter_username}`}
                target='_blank'
                rel='noopener noreferrer'
                className='px-3 py-1 bg-[var(--background)] text-[var(--text-secondary)] hover:text-[var(--primary)] rounded-full text-xs font-mono transition-colors'
              >
                @{userData.twitter_username}
              </a>
            )}
          </div>
        </div>

        {/* Contact card - Terminal inspired */}
        <div className='w-full max-w-lg space-y-4'>
          <div className='card bg-[var(--card-bg)] border border-[var(--card-border)] overflow-hidden'>
            <div className='flex items-center gap-2 px-4 py-2 border-b border-[var(--card-border)] bg-opacity-50'>
              <div className='w-3 h-3 rounded-full bg-red-500'></div>
              <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
              <div className='w-3 h-3 rounded-full bg-green-500'></div>
              <div className='ml-2 text-xs font-mono text-[var(--text-secondary)]'>
                contact.md
              </div>
            </div>
            <div className='p-4'>
              {/* GitHub */}
              <div className='mb-6'>
                <div className='flex items-start gap-2 mb-2'>
                  <span className='font-mono text-[var(--primary)]'>$</span>
                  <span className='text-[var(--text-secondary)]'>
                    type github.txt
                  </span>
                </div>
                <a
                  href={userData.html_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='ml-4 flex items-center gap-3 group'
                >
                  <div className='w-8 h-8 bg-[var(--background)] rounded-full flex items-center justify-center flex-shrink-0 border border-[var(--card-border)] group-hover:border-[var(--primary)] transition-colors'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors'
                    >
                      <path d='M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22'></path>
                    </svg>
                  </div>

                  <span className='font-mono group-hover:text-[var(--primary)] transition-colors'>
                    {userData.html_url}
                  </span>
                </a>
              </div>

              {/* Website/Blog */}
              {userData.blog && (
                <div className='mb-6'>
                  <div className='flex items-start gap-2 mb-2'>
                    <span className='font-mono text-[var(--primary)]'>$</span>
                    <span className='text-[var(--text-secondary)]'>
                      type website.txt
                    </span>
                  </div>
                  <a
                    href={
                      userData.blog.startsWith('http')
                        ? userData.blog
                        : `https://${userData.blog}`
                    }
                    target='_blank'
                    rel='noopener noreferrer'
                    className='ml-4 flex items-center gap-3 group'
                  >
                    <div className='w-8 h-8 bg-[var(--background)] rounded-full flex items-center justify-center flex-shrink-0 border border-[var(--card-border)] group-hover:border-[var(--primary)] transition-colors'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors'
                      >
                        <circle cx='12' cy='12' r='10'></circle>
                        <line x1='2' y1='12' x2='22' y2='12'></line>
                        <path d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'></path>
                      </svg>
                    </div>

                    <span className='font-mono group-hover:text-[var(--primary)] transition-colors truncate max-w-[250px]'>
                      {userData.blog}
                    </span>
                  </a>
                </div>
              )}

              {/* Twitter */}
              {userData.twitter_username && (
                <div className='mb-6'>
                  <div className='flex items-start gap-2 mb-2'>
                    <span className='font-mono text-[var(--primary)]'>$</span>
                    <span className='text-[var(--text-secondary)]'>
                      type twitter.txt
                    </span>
                  </div>
                  <a
                    href={`https://twitter.com/${userData.twitter_username}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='ml-4 flex items-center gap-3 group'
                  >
                    <div className='w-8 h-8 bg-[var(--background)] rounded-full flex items-center justify-center flex-shrink-0 border border-[var(--card-border)] group-hover:border-[var(--primary)] transition-colors'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors'
                      >
                        <path d='M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z'></path>
                      </svg>
                    </div>

                    <span className='font-mono group-hover:text-[var(--primary)] transition-colors'>
                      @{userData.twitter_username}
                    </span>
                  </a>
                </div>
              )}

              {/* Email - Only show if available */}
              {userData.email && (
                <div className='mb-6'>
                  <div className='flex items-start gap-2 mb-2'>
                    <span className='font-mono text-[var(--primary)]'>$</span>
                    <span className='text-[var(--text-secondary)]'>
                      type email.txt
                    </span>
                  </div>
                  <a
                    href={`mailto:${userData.email}`}
                    className='ml-4 flex items-center gap-3 group'
                  >
                    <div className='w-8 h-8 bg-[var(--background)] rounded-full flex items-center justify-center flex-shrink-0 border border-[var(--card-border)] group-hover:border-[var(--primary)] transition-colors'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors'
                      >
                        <path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'></path>
                        <polyline points='22,6 12,13 2,6'></polyline>
                      </svg>
                    </div>

                    <span className='font-mono group-hover:text-[var(--primary)] transition-colors'>
                      {userData.email}
                    </span>
                  </a>
                </div>
              )}

              {/* Company - if available */}
              {userData.company && (
                <div className='mb-6'>
                  <div className='flex items-start gap-2 mb-2'>
                    <span className='font-mono text-[var(--primary)]'>$</span>
                    <span className='text-[var(--text-secondary)]'>
                      type company.txt
                    </span>
                  </div>
                  <div className='ml-4 flex items-center gap-3'>
                    <div className='w-8 h-8 bg-[var(--background)] rounded-full flex items-center justify-center flex-shrink-0 border border-[var(--card-border)]'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='text-[var(--text-secondary)]'
                      >
                        <path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'></path>
                        <polyline points='9 22 9 12 15 12 15 22'></polyline>
                      </svg>
                    </div>

                    <span className='font-mono'>{userData.company}</span>
                  </div>
                </div>
              )}

              {/* Location - if available */}
              {userData.location && (
                <div className='mb-6'>
                  <div className='flex items-start gap-2 mb-2'>
                    <span className='font-mono text-[var(--primary)]'>$</span>
                    <span className='text-[var(--text-secondary)]'>
                      type location.txt
                    </span>
                  </div>
                  <div className='ml-4 flex items-center gap-3'>
                    <div className='w-8 h-8 bg-[var(--background)] rounded-full flex items-center justify-center flex-shrink-0 border border-[var(--card-border)]'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='text-[var(--text-secondary)]'
                      >
                        <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'></path>
                        <circle cx='12' cy='10' r='3'></circle>
                      </svg>
                    </div>

                    <span className='font-mono'>{userData.location}</span>
                  </div>
                </div>
              )}

              {/* Blinking cursor */}
              <div className='flex items-start gap-2'>
                <span className='font-mono text-[var(--primary)]'>$</span>
                <span className='text-[var(--text-secondary)] animate-pulse'>
                  █
                </span>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className='mt-8 flex justify-center gap-4'>
            <a
              href={userData.html_url}
              target='_blank'
              rel='noopener noreferrer'
              className='px-4 py-2 bg-[var(--card-bg)] hover:bg-[var(--primary)] hover:text-white border border-[var(--card-border)] rounded-md flex items-center gap-2 transition-colors'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22'></path>
              </svg>
              View on GitHub
            </a>

            {userData.email && (
              <a
                href={`mailto:${userData.email}`}
                className='px-4 py-2 bg-[var(--card-bg)] hover:bg-[var(--primary)] hover:text-white border border-[var(--card-border)] rounded-md flex items-center gap-2 transition-colors'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'></path>
                  <polyline points='22,6 12,13 2,6'></polyline>
                </svg>
                Send Email
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
