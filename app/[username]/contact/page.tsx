'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import BottomNavigation from '@/components/BottomNavigation';
import { GitHubUser } from '@/types';

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
        // Create headers with token if available
        const headers: HeadersInit = {};
        if (token) {
          headers.Authorization = `token ${token}`;
        }

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
        <div className='w-16 h-16 relative'>
          <div className='absolute inset-0 rounded-full border-2 border-[#8976EA] border-t-transparent animate-spin'></div>
        </div>
        <p className='mt-4 text-gray-400'>Loading contact info...</p>
      </div>
    );
  }

  if (error || !userData) {
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
        <p className='text-gray-400 mb-6'>
          {error || "Couldn't load contact information"}
        </p>
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
    <div className='flex flex-col items-center pb-32'>
      {/* Header */}
      <div className='w-full flex justify-between items-center mb-12'>
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

        <h1 className='text-xl font-bold'>Contact</h1>
      </div>

      {/* Profile overview */}
      <div className='flex flex-col items-center mb-12'>
        <div className='w-32 h-32 rounded-full overflow-hidden border-2 border-white mb-6'>
          <Image
            src={userData.avatar_url}
            alt={userData.name || userData.login}
            width={128}
            height={128}
            className='object-cover'
          />
        </div>

        <h2 className='text-2xl font-bold mb-1'>
          {userData.name || userData.login}
        </h2>
        <p className='text-gray-400'>{userData.location || 'Developer'}</p>
      </div>

      {/* Contact methods */}
      <div className='w-full max-w-md space-y-6'>
        {/* GitHub */}
        <a
          href={userData.html_url}
          target='_blank'
          rel='noopener noreferrer'
          className='bg-[#111111] border border-[#222222] rounded-lg p-4 flex items-center gap-4 w-full hover:border-[#8976EA] transition-all'
        >
          <div className='w-10 h-10 bg-[#191919] rounded-full flex items-center justify-center flex-shrink-0'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22'></path>
            </svg>
          </div>

          <div className='flex-grow'>
            <h3 className='font-medium'>GitHub</h3>
            <p className='text-gray-400 text-sm'>{userData.html_url}</p>
          </div>

          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5 text-gray-400'
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path
              fillRule='evenodd'
              d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
              clipRule='evenodd'
            />
          </svg>
        </a>

        {/* Website/Blog */}
        {userData.blog && (
          <a
            href={
              userData.blog.startsWith('http')
                ? userData.blog
                : `https://${userData.blog}`
            }
            target='_blank'
            rel='noopener noreferrer'
            className='bg-[#111111] border border-[#222222] rounded-lg p-4 flex items-center gap-4 w-full hover:border-[#8976EA] transition-all'
          >
            <div className='w-10 h-10 bg-[#191919] rounded-full flex items-center justify-center flex-shrink-0'>
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
                <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'></path>
                <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'></path>
              </svg>
            </div>

            <div className='flex-grow'>
              <h3 className='font-medium'>Website</h3>
              <p className='text-gray-400 text-sm truncate'>{userData.blog}</p>
            </div>

            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 text-gray-400'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                clipRule='evenodd'
              />
            </svg>
          </a>
        )}

        {/* Twitter */}
        {userData.twitter_username && (
          <a
            href={`https://twitter.com/${userData.twitter_username}`}
            target='_blank'
            rel='noopener noreferrer'
            className='bg-[#111111] border border-[#222222] rounded-lg p-4 flex items-center gap-4 w-full hover:border-[#8976EA] transition-all'
          >
            <div className='w-10 h-10 bg-[#191919] rounded-full flex items-center justify-center flex-shrink-0'>
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
            </div>

            <div className='flex-grow'>
              <h3 className='font-medium'>Twitter</h3>
              <p className='text-gray-400 text-sm'>
                @{userData.twitter_username}
              </p>
            </div>

            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 text-gray-400'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                clipRule='evenodd'
              />
            </svg>
          </a>
        )}

        {/* Email - Only show if available */}
        {userData.email && (
          <a
            href={`mailto:${userData.email}`}
            className='bg-[#111111] border border-[#222222] rounded-lg p-4 flex items-center gap-4 w-full hover:border-[#8976EA] transition-all'
          >
            <div className='w-10 h-10 bg-[#191919] rounded-full flex items-center justify-center flex-shrink-0'>
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
                <path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'></path>
                <polyline points='22,6 12,13 2,6'></polyline>
              </svg>
            </div>

            <div className='flex-grow'>
              <h3 className='font-medium'>Email</h3>
              <p className='text-gray-400 text-sm'>{userData.email}</p>
            </div>

            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 text-gray-400'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                clipRule='evenodd'
              />
            </svg>
          </a>
        )}

        {/* Company - if available */}
        {userData.company && (
          <div className='bg-[#111111] border border-[#222222] rounded-lg p-4 flex items-center gap-4 w-full'>
            <div className='w-10 h-10 bg-[#191919] rounded-full flex items-center justify-center flex-shrink-0'>
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
                <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'></path>
              </svg>
            </div>

            <div className='flex-grow'>
              <h3 className='font-medium'>Organization</h3>
              <p className='text-gray-400 text-sm'>{userData.company}</p>
            </div>
          </div>
        )}

        {/* Location - if available */}
        {userData.location && (
          <div className='bg-[#111111] border border-[#222222] rounded-lg p-4 flex items-center gap-4 w-full'>
            <div className='w-10 h-10 bg-[#191919] rounded-full flex items-center justify-center flex-shrink-0'>
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
                <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'></path>
                <circle cx='12' cy='10' r='3'></circle>
              </svg>
            </div>

            <div className='flex-grow'>
              <h3 className='font-medium'>Location</h3>
              <p className='text-gray-400 text-sm'>{userData.location}</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation username={username} />
    </div>
  );
}
