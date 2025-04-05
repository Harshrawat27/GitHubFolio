import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BottomNavigationProps {
  username: string;
}

export default function BottomNavigation({ username }: BottomNavigationProps) {
  const pathname = usePathname();

  // Determine which tab is active
  const isHomePage = pathname === `/${username}`;
  const isProjectsPage =
    pathname === `/${username}/projects` ||
    pathname.startsWith(`/${username}/projects/`);
  const isContactPage = pathname === `/${username}/contact`;

  return (
    <div className='fixed bottom-0 left-0 right-0 bg-black bg-opacity-80 backdrop-blur-md border-t border-[#222222] py-4 px-6 z-50'>
      <div className='container mx-auto max-w-[800px]'>
        <div className='flex justify-around items-center'>
          {/* Home */}
          <Link
            href={`/${username}`}
            className={`flex flex-col items-center transition-colors ${
              isHomePage
                ? 'text-[#8976EA]'
                : 'text-gray-400 hover:text-[#8976EA]'
            }`}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
              />
            </svg>
            <span className='text-xs mt-1'>Home</span>
          </Link>

          {/* Projects */}
          <Link
            href={`/${username}/projects`}
            className={`flex flex-col items-center transition-colors ${
              isProjectsPage
                ? 'text-[#8976EA]'
                : 'text-gray-400 hover:text-[#8976EA]'
            }`}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
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
            <span className='text-xs mt-1'>Projects</span>
          </Link>

          {/* Contact */}
          <Link
            href={`/${username}/contact`}
            className={`flex flex-col items-center transition-colors ${
              isContactPage
                ? 'text-[#8976EA]'
                : 'text-gray-400 hover:text-[#8976EA]'
            }`}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
              />
            </svg>
            <span className='text-xs mt-1'>Contact</span>
          </Link>

          {/* GitHub */}
          <a
            href={`https://github.com/${username}`}
            target='_blank'
            rel='noopener noreferrer'
            className='flex flex-col items-center text-gray-400 hover:text-[#8976EA] transition-colors'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
              />
            </svg>
            <span className='text-xs mt-1'>GitHub</span>
          </a>
        </div>
      </div>
    </div>
  );
}
