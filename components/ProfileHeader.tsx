import Image from 'next/image';
import { GitHubUser } from '@/types';
import {
  CalendarIcon,
  MapPinIcon,
  LinkIcon,
  BuildingIcon,
} from '@/components/Icons';

interface ProfileHeaderProps {
  user: GitHubUser;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className='bg-white p-6 rounded-lg shadow-md'>
      <div className='flex flex-col md:flex-row items-center md:items-start gap-6'>
        <div className='flex-shrink-0'>
          <Image
            src={user.avatar_url}
            alt={`${user.login} avatar`}
            width={120}
            height={120}
            className='rounded-full'
          />
        </div>

        <div className='flex-grow'>
          <div className='text-center md:text-left'>
            <h2 className='text-2xl font-bold'>{user.name || user.login}</h2>
            <a
              href={user.html_url}
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 hover:underline'
            >
              @{user.login}
            </a>

            {user.bio && <p className='my-2 text-gray-700'>{user.bio}</p>}
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4'>
            {user.company && (
              <div className='flex items-center gap-2'>
                <BuildingIcon className='h-5 w-5 text-gray-500' />
                <span>{user.company}</span>
              </div>
            )}

            {user.location && (
              <div className='flex items-center gap-2'>
                <MapPinIcon className='h-5 w-5 text-gray-500' />
                <span>{user.location}</span>
              </div>
            )}

            {user.blog && (
              <div className='flex items-center gap-2'>
                <LinkIcon className='h-5 w-5 text-gray-500' />
                <a
                  href={
                    user.blog.startsWith('http')
                      ? user.blog
                      : `https://${user.blog}`
                  }
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:underline truncate'
                >
                  {user.blog}
                </a>
              </div>
            )}

            <div className='flex items-center gap-2'>
              <CalendarIcon className='h-5 w-5 text-gray-500' />
              <span>Joined {formatDate(user.created_at)}</span>
            </div>
          </div>

          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6'>
            <div className='text-center p-3 bg-gray-100 rounded-lg'>
              <div className='text-xl font-bold'>{user.public_repos}</div>
              <div className='text-sm text-gray-600'>Repositories</div>
            </div>

            <div className='text-center p-3 bg-gray-100 rounded-lg'>
              <div className='text-xl font-bold'>{user.followers}</div>
              <div className='text-sm text-gray-600'>Followers</div>
            </div>

            <div className='text-center p-3 bg-gray-100 rounded-lg'>
              <div className='text-xl font-bold'>{user.following}</div>
              <div className='text-sm text-gray-600'>Following</div>
            </div>

            <div className='text-center p-3 bg-gray-100 rounded-lg'>
              <div className='text-xl font-bold'>{user.public_gists}</div>
              <div className='text-sm text-gray-600'>Gists</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
