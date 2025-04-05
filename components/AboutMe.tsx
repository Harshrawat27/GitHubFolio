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

  return (
    <section className='w-full mb-16'>
      <h2 className='text-2xl font-bold mb-6'>About Me</h2>

      <div className='prose prose-invert max-w-none'>
        <p className='text-gray-300 leading-relaxed'>
          {user.bio || defaultBio}
        </p>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8'>
        <div className='text-center'>
          <p className='text-2xl font-bold text-[#8976EA]'>
            {user.public_repos}
          </p>
          <p className='text-sm text-gray-400'>Repositories</p>
        </div>

        <div className='text-center'>
          <p className='text-2xl font-bold text-[#8976EA]'>{user.followers}</p>
          <p className='text-sm text-gray-400'>Followers</p>
        </div>

        <div className='text-center'>
          <p className='text-2xl font-bold text-[#8976EA]'>{user.following}</p>
          <p className='text-sm text-gray-400'>Following</p>
        </div>

        <div className='text-center'>
          <p className='text-2xl font-bold text-[#8976EA]'>{yearsOnGitHub}</p>
          <p className='text-sm text-gray-400'>Years</p>
        </div>
      </div>
    </section>
  );
}
