'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function NotFound() {
  const params = useParams();
  const username = params.username;

  return (
    <div className='min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16'>
      <div className='w-16 h-16 bg-[#191919] flex items-center justify-center rounded-full border border-[#333333] mb-6'>
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
            d='M6 18L18 6M6 6l12 12'
          />
        </svg>
      </div>

      <h2 className='text-3xl font-bold mb-4 font-mono'>Profile Not Found</h2>

      <p className='text-xl mb-6 text-gray-300'>
        We couldn't find a GitHub profile for "
        <span className='text-[#8976EA]'>{username}</span>".
      </p>

      <p className='mb-8 text-gray-500 max-w-md'>
        Please check that you've entered a valid GitHub username or try again
        later.
      </p>

      <Link
        href='/'
        className='bg-[#8976EA] hover:bg-[#6F5BD0] text-white px-6 py-3 rounded-md transition-colors font-medium'
      >
        Back to Home
      </Link>
    </div>
  );
}
