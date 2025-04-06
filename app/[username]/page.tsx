'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { GitHubUser, Repository } from '@/types';
import FeaturedProjects from '@/components/FeaturedProjects';
import AboutMe from '@/components/AboutMe';
import BottomNavigation from '@/components/BottomNavigation';
import { createGitHubHeaders } from '@/lib/githubToken';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [userData, setUserData] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [pinnedRepos, setPinnedRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);

  // Check for token in localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('github_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch GitHub profile data when component mounts or token changes
  useEffect(() => {
    const fetchGitHubProfile = async () => {
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

        // Fetch repositories
        const reposResponse = await fetch(
          `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`,
          { headers }
        );

        const reposData = await reposResponse.json();
        setRepos(reposData);

        // Fetch pinned repositories using GraphQL (with our GitHub token)
        try {
          const query = {
            query: `
              query {
                user(login: "${username}") {
                  pinnedItems(first: 6, types: REPOSITORY) {
                    nodes {
                      ... on Repository {
                        name
                        description
                        url
                        stargazerCount
                        forkCount
                        primaryLanguage {
                          name
                          color
                        }
                        repositoryTopics(first: 5) {
                          nodes {
                            topic {
                              name
                            }
                          }
                        }
                        owner {
                          login
                          avatarUrl
                        }
                      }
                    }
                  }
                }
              }
            `,
          };

          // Use a GitHub token - either from localStorage or a hardcoded one for demos
          // Be careful with exposing tokens in production code
          const token =
            localStorage.getItem('github_token') ||
            process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN;

          const res = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(query),
          });

          const graphqlData = await res.json();
          const pinnedItems = graphqlData?.data?.user?.pinnedItems?.nodes || [];

          // Convert GraphQL data format to match our Repository type
          const formattedPinnedRepos = pinnedItems.map((item: any) => {
            // Create topic array from the GraphQL response
            const topics = item.repositoryTopics.nodes.map(
              (node: any) => node.topic.name
            );

            return {
              id: item.name, // Use name as ID since we don't have the actual ID
              name: item.name,
              full_name: `${item.owner.login}/${item.name}`,
              html_url: item.url,
              description: item.description,
              fork: false, // We don't have this info from the GraphQL response
              language: item.primaryLanguage?.name || null,
              stargazers_count: item.stargazerCount,
              forks_count: item.forkCount,
              topics: topics,
              owner: {
                login: item.owner.login,
                avatar_url: item.owner.avatarUrl,
                html_url: `https://github.com/${item.owner.login}`,
              },
            };
          });

          // Set pinned repos state
          setPinnedRepos(formattedPinnedRepos);
        } catch (error) {
          console.error('Failed to fetch pinned repos with GraphQL:', error);
          // Fallback: Just use regular repos sorted by stars
          const fallbackRepos = [...reposData]
            .filter((repo) => !repo.fork)
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 6);
          setPinnedRepos(fallbackRepos);
        }

        // Extract skills from languages
        const languages = new Set<string>();
        reposData.forEach((repo: Repository) => {
          if (repo.language) {
            languages.add(repo.language);
          }
        });
        setSkills(Array.from(languages).slice(0, 6));
      } catch (error) {
        if (error instanceof Error) {
          setError(`Error: ${error.message}`);
        } else {
          setError(
            'Error fetching GitHub profile. Please check the username and try again.'
          );
        }
        setUserData(null);
        setRepos([]);
        setPinnedRepos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubProfile();
  }, [username, token]);

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <div className='w-16 h-16 relative'>
          <div className='absolute inset-0 rounded-full border-2 border-[#8976EA] border-t-transparent animate-spin'></div>
        </div>
        <p className='mt-4 text-gray-400'>Loading profile...</p>
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
        <h2 className='text-2xl font-bold mb-2'>Profile Not Found</h2>
        <p className='text-gray-400 mb-6'>
          {error || "Couldn't load this profile"}
        </p>
        <Link
          href='/'
          className='px-6 py-2 bg-[#8976EA] rounded-full text-white'
        >
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center pt-12 pb-32'>
      {/* Profile Header */}
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

        <h1 className='text-3xl font-bold mb-1'>
          {userData.name || userData.login}
        </h1>
        <p className='text-gray-400 mb-4'>
          {userData.bio || 'Developer & Creator'}
        </p>

        <div className='flex space-x-4 mb-6'>
          <a
            href={userData.html_url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-white'
          >
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
          </a>
          {userData.blog && (
            <a
              href={
                userData.blog.startsWith('http')
                  ? userData.blog
                  : `https://${userData.blog}`
              }
              target='_blank'
              rel='noopener noreferrer'
              className='text-white'
            >
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
                <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'></path>
                <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'></path>
              </svg>
            </a>
          )}
        </div>

        {skills.length > 0 && (
          <div className='flex flex-wrap justify-center gap-2'>
            {skills.map((skill) => (
              <span
                key={skill}
                className='px-3 py-1 bg-[#111111] rounded-full text-sm'
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* About Me Section */}
      <AboutMe user={userData} />

      {/* Featured Projects Section - Using pinned repositories */}
      <FeaturedProjects repos={pinnedRepos} />

      {/* Bottom Navigation Bar */}
      <BottomNavigation username={username} />
    </div>
  );
}
