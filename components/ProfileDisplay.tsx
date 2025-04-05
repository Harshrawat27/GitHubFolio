import { GitHubUser, Repository } from '@/types';
import ProfileHeader from './ProfileHeader';
import PinnedRepos from './PinnedRepos';
import RepoStats from './RepoStats';
import ActivityGraph from './ActivityGraph';
import CommitHistory from './CommitHistory';

interface ProfileDisplayProps {
  user: GitHubUser;
  repos: Repository[];
  loading: boolean;
  token: string | null;
}

export default function ProfileDisplay({
  user,
  repos,
  loading,
  token,
}: ProfileDisplayProps) {
  return (
    <div className='space-y-6'>
      <ProfileHeader user={user} />

      <PinnedRepos username={user.login} repos={repos} token={token} />

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <RepoStats repos={repos} />
        <ActivityGraph username={user.login} token={token} />
      </div>

      <CommitHistory repos={repos} username={user.login} token={token} />
    </div>
  );
}
