'use client';

import { useState } from 'react';
import ProfileSearch from '@/components/ProfileSearch';
import ProfileDisplay from '@/components/ProfileDisplay';
import GitHubAuth from '@/components/GitHubAuth';
import SimilarProfiles from '@/components/SimilarProfiles';
import { GitHubUser, Repository } from '@/types';

export default function Home() {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);

  const handleTokenChange = (newToken: string | null) => {
    setToken(newToken);
  };

  const fetchGitHubProfile = async (githubUsername: string) => {
    setUsername(githubUsername);
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
        `https://api.github.com/users/${githubUsername}`,
        { headers }
      );
      if (!userResponse.ok) {
        throw new Error(`User not found (${userResponse.status})`);
      }
      const userData = await userResponse.json();
      setUserData(userData);

      // Fetch repositories
      const reposResponse = await fetch(
        `https://api.github.com/users/${githubUsername}/repos?per_page=100&sort=pushed`,
        { headers }
      );
      const reposData = await reposResponse.json();
      setRepos(reposData);

      setLoading(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(`Error: ${error.message}`);
      } else {
        setError(
          'Error fetching GitHub profile. Please check the username and try again.'
        );
      }
      setLoading(false);
      setUserData(null);
      setRepos([]);
    }
  };

  const handleSearch = (username: string) => {
    fetchGitHubProfile(username);
  };

  const handleSimilarProfileSelect = (username: string) => {
    // Scroll to top before loading new profile
    window.scrollTo(0, 0);
    fetchGitHubProfile(username);
  };

  return (
    <div className='space-y-4'>
      <GitHubAuth onTokenChange={handleTokenChange} />

      <ProfileSearch onSearch={handleSearch} loading={loading} />

      {error && (
        <div className='p-4 bg-red-100 text-red-700 rounded-lg'>{error}</div>
      )}

      {userData && (
        <>
          <ProfileDisplay
            user={userData}
            repos={repos}
            loading={loading}
            token={token}
          />

          <SimilarProfiles
            user={userData}
            repos={repos}
            token={token}
            onProfileSelect={handleSimilarProfileSelect}
          />
        </>
      )}
    </div>
  );
}
