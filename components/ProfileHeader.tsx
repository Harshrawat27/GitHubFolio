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
    <div className='card'>
      <div className='flex flex-col md:flex-row items-center md:items-start gap-6'>
        <div className='flex-shrink-0'>
          <div className='w-28 h-28 relative rounded-full overflow-hidden border-2 border-[#8976EA] p-1'>
            <Image
              src={user.avatar_url}
              alt={`${user.login} avatar`}
              fill
              className='rounded-full object-cover'
            />
          </div>
        </div>

        <div className='flex-grow'>
          <div className='text-center md:text-left'>
            <h2 className='text-2xl font-bold'>{user.name || user.login}</h2>
            <a
              href={user.html_url}
              target='_blank'
              rel='noopener noreferrer'
              className='text-[#8976EA] hover:text-[#A595F0] font-mono transition-colors'
            >
              @{user.login}
            </a>

            {user.bio && <p className='my-3 text-gray-300'>{user.bio}</p>}
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm'>
            {user.company && (
              <div className='flex items-center gap-2'>
                <BuildingIcon className='h-4 w-4 text-[#8976EA]' />
                <span className='text-gray-300'>{user.company}</span>
              </div>
            )}

            {user.location && (
              <div className='flex items-center gap-2'>
                <MapPinIcon className='h-4 w-4 text-[#8976EA]' />
                <span className='text-gray-300'>{user.location}</span>
              </div>
            )}

            {user.blog && (
              <div className='flex items-center gap-2'>
                <LinkIcon className='h-4 w-4 text-[#8976EA]' />
                <a
                  href={
                    user.blog.startsWith('http')
                      ? user.blog
                      : `https://${user.blog}`
                  }
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-[#8976EA] hover:text-[#A595F0] truncate transition-colors'
                >
                  {user.blog}
                </a>
              </div>
            )}

            <div className='flex items-center gap-2'>
              <CalendarIcon className='h-4 w-4 text-[#8976EA]' />
              <span className='text-gray-300'>
                Joined {formatDate(user.created_at)}
              </span>
            </div>
          </div>

          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6'>
            <div className='text-center p-3 bg-[#191919] rounded-lg border border-[#222222]'>
              <div className='text-xl font-bold'>{user.public_repos}</div>
              <div className='text-xs text-gray-400'>Repositories</div>
            </div>

            <div className='text-center p-3 bg-[#191919] rounded-lg border border-[#222222]'>
              <div className='text-xl font-bold'>{user.followers}</div>
              <div className='text-xs text-gray-400'>Followers</div>
            </div>

            <div className='text-center p-3 bg-[#191919] rounded-lg border border-[#222222]'>
              <div className='text-xl font-bold'>{user.following}</div>
              <div className='text-xs text-gray-400'>Following</div>
            </div>

            <div className='text-center p-3 bg-[#191919] rounded-lg border border-[#222222]'>
              <div className='text-xl font-bold'>{user.public_gists}</div>
              <div className='text-xs text-gray-400'>Gists</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
