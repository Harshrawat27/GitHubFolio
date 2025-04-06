// components/AboutMe.tsx
import { GitHubUser } from '@/types';

interface AboutMeProps {
  user: GitHubUser;
}

export default function AboutMe({ user }: AboutMeProps) {
  // Calculate years on GitHub
  const joinDate = new Date(user.created_at);
  const currentDate = new Date();
  const yearsOnGitHub = Math.floor(
    (currentDate.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
  );

  // Create a bio if none exists
  const defaultBio = `
    Hey, I'm ${user.name || user.login} from ${
    user.location || 'around the world'
  }! 
    I've been coding on GitHub for ${yearsOnGitHub} ${
    yearsOnGitHub === 1 ? 'year' : 'years'
  }.
    I have ${user.public_repos} repositories and ${user.followers} followers.
  `;

  // Format the join date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className='space-y-4 text-[var(--text-primary)]'>
      <div className='flex items-center gap-2 mb-2'>
        <span className='font-mono text-[var(--primary)]'>$</span>
        <span className='text-[var(--text-secondary)]'>whoami</span>
      </div>

      <div className='pl-4'>
        <p className='leading-relaxed whitespace-pre-line'>
          {user.bio || defaultBio}
        </p>
      </div>

      <div className='flex items-center gap-2 mb-2'>
        <span className='font-mono text-[var(--primary)]'>$</span>
        <span className='text-[var(--text-secondary)]'>
          git log --author="{user.login}" --since="first commit"
        </span>
      </div>

      <div className='pl-4 space-y-2'>
        <div className='flex flex-wrap gap-x-6 gap-y-2'>
          <div className='flex items-center gap-2'>
            <span className='text-[var(--primary)] font-mono'>
              first-commit
            </span>
            <span>{formatDate(joinDate)}</span>
          </div>

          <div className='flex items-center gap-2'>
            <span className='text-[var(--primary)] font-mono'>total-repos</span>
            <span>{user.public_repos}</span>
          </div>

          <div className='flex items-center gap-2'>
            <span className='text-[var(--primary)] font-mono'>followers</span>
            <span>{user.followers}</span>
          </div>

          <div className='flex items-center gap-2'>
            <span className='text-[var(--primary)] font-mono'>following</span>
            <span>{user.following}</span>
          </div>

          <div className='flex items-center gap-2'>
            <span className='text-[var(--primary)] font-mono'>experience</span>
            <span>
              {yearsOnGitHub} {yearsOnGitHub === 1 ? 'year' : 'years'}
            </span>
          </div>
        </div>
      </div>

      <div className='flex items-center gap-2 mb-2'>
        <span className='font-mono text-[var(--primary)]'>$</span>
        <span className='text-[var(--text-secondary)]'>cat contact.md</span>
      </div>

      <div className='pl-4 space-y-2'>
        {user.email && (
          <div className='flex items-center gap-2'>
            <span className='text-[var(--primary)] font-mono'>email</span>
            <a href={`mailto:${user.email}`} className='hover:underline'>
              {user.email}
            </a>
          </div>
        )}

        {user.blog && (
          <div className='flex items-center gap-2'>
            <span className='text-[var(--primary)] font-mono'>website</span>
            <a
              href={
                user.blog.startsWith('http')
                  ? user.blog
                  : `https://${user.blog}`
              }
              target='_blank'
              rel='noopener noreferrer'
              className='hover:underline'
            >
              {user.blog}
            </a>
          </div>
        )}

        {user.twitter_username && (
          <div className='flex items-center gap-2'>
            <span className='text-[var(--primary)] font-mono'>twitter</span>
            <a
              href={`https://twitter.com/${user.twitter_username}`}
              target='_blank'
              rel='noopener noreferrer'
              className='hover:underline'
            >
              @{user.twitter_username}
            </a>
          </div>
        )}

        {user.location && (
          <div className='flex items-center gap-2'>
            <span className='text-[var(--primary)] font-mono'>location</span>
            <span>{user.location}</span>
          </div>
        )}

        {user.company && (
          <div className='flex items-center gap-2'>
            <span className='text-[var(--primary)] font-mono'>company</span>
            <span>{user.company}</span>
          </div>
        )}
      </div>

      <div className='flex items-center gap-2 mb-2'>
        <span className='font-mono text-[var(--primary)]'>$</span>
        <span className='text-[var(--text-secondary)] animate-pulse'>█</span>
      </div>
    </div>
  );
}
