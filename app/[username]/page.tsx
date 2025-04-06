// app/[username]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { GitHubUser, Repository } from '@/types';
import FeaturedProjects from '@/components/FeaturedProjects';
import SideNav from '@/components/SideNav';
import AboutMeWithReadme from '@/components/AboutMeWithReadme';
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

            // Get homepage URL if available from the repository (for live demo links)
            let homepage = null;

            // Try to fetch additional details for this repository to get accurate dates and homepage
            // This is a bit more complex but provides better data
            let repoDetails = reposData.find(
              (repo: any) => repo.name === item.name
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
                id: 0, // Placeholder as we don't have this from GraphQL
              },
              // Use data from repoDetails if available, otherwise use fallbacks
              created_at: repoDetails?.created_at || new Date().toISOString(),
              updated_at: repoDetails?.updated_at || new Date().toISOString(),
              pushed_at: repoDetails?.pushed_at || new Date().toISOString(),
              homepage: repoDetails?.homepage || null, // For live demo links
              size: 0,
              watchers_count: 0,
              open_issues_count: 0,
              license: null,
              visibility: '',
              default_branch: '',
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
        <div className='relative w-16 h-16'>
          <div className='absolute inset-0 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin'></div>
          <div className='absolute inset-0 m-auto w-2 h-2 bg-[var(--primary)] rounded-full'></div>
        </div>
        <h2 className='text-xl font-bold mt-8 mb-2 font-mono'>
          Creating your portfolio...
        </h2>
        <p className='text-[var(--text-secondary)] max-w-md text-center'>
          We're fetching your GitHub data and crafting a beautiful developer
          portfolio.
        </p>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className='flex flex-col items-center justify-center h-screen text-center px-4'>
        <div className='w-16 h-16 bg-[var(--card-bg)] flex items-center justify-center rounded-full border border-[var(--card-border)] mb-6'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-8 w-8 text-[var(--primary)]'
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

        <p className='text-xl mb-6 text-[var(--text-secondary)]'>
          We couldn't find a GitHub profile for "
          <span className='text-[var(--primary)]'>{username}</span>".
        </p>

        <p className='mb-8 text-[var(--text-secondary)] max-w-md'>
          Please check that you've entered a valid GitHub username or try again
          later.
        </p>

        <Link
          href='/'
          className='bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white px-6 py-3 rounded-md transition-colors font-medium'
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <>
      <SideNav username={username} />

      <div className='flex flex-col items-center pt-12 pb-32 relative'>
        {/* Date indicator */}
        <div className='date-marker top-8 right-0'>
          {new Date().toISOString().split('T')[0]}
        </div>

        {/* Profile Header */}
        <div className='flex flex-col items-center mb-16 relative'>
          <div className='w-32 h-32 rounded-full overflow-hidden border-2 border-[var(--primary)] p-1 mb-6 relative'>
            <Image
              src={userData.avatar_url}
              alt={userData.name || userData.login}
              fill
              className='rounded-full object-cover'
            />
            <div className='absolute -z-10 w-40 h-40 bg-[var(--primary)] opacity-20 blur-xl'></div>
          </div>

          <h1 className='text-4xl font-bold mb-2 title-gradient'>
            {userData.name || userData.login}
          </h1>

          <div className='font-mono text-[var(--text-secondary)] mb-6 flex items-center'>
            <span>@{userData.login}</span>
            <span className='mx-2 text-xs'>•</span>
            <span className='text-sm'>
              {userData.location && (
                <span className='flex items-center'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 mr-1'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                    />
                  </svg>
                  {userData.location}
                </span>
              )}
            </span>
          </div>

          {userData.bio && (
            <p className='text-[var(--text-secondary)] text-center max-w-md mb-8'>
              {userData.bio}
            </p>
          )}

          <div className='flex space-x-4 mb-6'>
            {/* Link buttons with hover effects */}
            <a
              href={userData.html_url}
              target='_blank'
              rel='noopener noreferrer'
              className='bg-[var(--card-bg)] hover:bg-[var(--primary)] hover:text-white border border-[var(--card-border)] w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300'
            >
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
                className='bg-[var(--card-bg)] hover:bg-[var(--primary)] hover:text-white border border-[var(--card-border)] w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300'
              >
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
              </a>
            )}

            {userData.twitter_username && (
              <a
                href={`https://twitter.com/${userData.twitter_username}`}
                target='_blank'
                rel='noopener noreferrer'
                className='bg-[var(--card-bg)] hover:bg-[var(--primary)] hover:text-white border border-[var(--card-border)] w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300'
              >
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
              </a>
            )}
          </div>

          {/* Stats display */}
          <div className='grid grid-cols-4 gap-6 mt-2'>
            <div className='text-center'>
              <p className='text-2xl font-bold text-[var(--primary)]'>
                {userData.public_repos}
              </p>
              <p className='text-sm text-[var(--text-secondary)]'>
                Repositories
              </p>
            </div>

            <div className='text-center'>
              <p className='text-2xl font-bold text-[var(--primary)]'>
                {userData.followers}
              </p>
              <p className='text-sm text-[var(--text-secondary)]'>Followers</p>
            </div>

            <div className='text-center'>
              <p className='text-2xl font-bold text-[var(--primary)]'>
                {userData.following}
              </p>
              <p className='text-sm text-[var(--text-secondary)]'>Following</p>
            </div>

            <div className='text-center'>
              <p className='text-2xl font-bold text-[var(--primary)]'>
                {Math.floor(
                  (new Date().getTime() -
                    new Date(userData.created_at).getTime()) /
                    (1000 * 60 * 60 * 24 * 365)
                )}
              </p>
              <p className='text-sm text-[var(--text-secondary)]'>Years</p>
            </div>
          </div>

          {skills.length > 0 && (
            <div className='flex flex-wrap justify-center gap-2 mt-8'>
              {skills.map((skill) => (
                <span
                  key={skill}
                  className='px-3 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-full text-xs'
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Index marker */}
          <div className='absolute -right-4 top-0 text-xs font-mono text-[var(--text-secondary)] opacity-70'>
            #01
          </div>
        </div>

        {/* Contribution Graph - Hidden as requested */}
        {/* AI Analysis - Hidden as requested */}

        {/* Featured Projects Section */}
        <div className='w-full mb-16'>
          <h2 className='section-heading'>Featured Projects</h2>
          <div className='mb-6'></div>

          {repos.length === 0 ? (
            <div className='card text-center py-16'>
              <div className='w-20 h-20 mx-auto mb-6 bg-[var(--background)] rounded-full flex items-center justify-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-10 w-10 text-[var(--text-secondary)]'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.5}
                    d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.5}
                    d='M12 11v6m-3-3h6'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-bold mb-4'>No Repositories Found</h3>
              <p className='text-[var(--text-secondary)] mb-6 max-w-md mx-auto'>
                This GitHub profile doesn't have any public repositories yet.
                Start creating projects to showcase your skills!
              </p>
              <a
                href={`https://github.com/new`}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-dark)] transition-colors'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 mr-2'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                  />
                </svg>
                Create New Repository
              </a>
            </div>
          ) : pinnedRepos.length === 0 ? (
            <>
              <div className='mb-4 flex justify-between items-center'>
                <p className='text-[var(--text-secondary)] italic'>
                  No pinned repositories found. Showing most active projects.
                </p>
                <a
                  href={`https://github.com/${username}?tab=repositories`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-[var(--primary)] hover:underline text-sm flex items-center'
                >
                  <span>View all repositories</span>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 ml-1'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z'
                      clipRule='evenodd'
                    />
                  </svg>
                </a>
              </div>
              <FeaturedProjects
                repos={repos
                  .filter((repo) => !repo.fork)
                  .sort(
                    (a, b) =>
                      new Date(b.pushed_at).getTime() -
                      new Date(a.pushed_at).getTime()
                  )
                  .slice(0, 4)}
              />
            </>
          ) : (
            <FeaturedProjects repos={pinnedRepos} />
          )}
        </div>

        {/* About Me Section with GitHub README.md support */}
        <div className='w-full mb-16'>
          <h2 className='section-heading'>About Me</h2>
          <AboutMeWithReadme
            username={username}
            user={userData}
            token={token}
          />
        </div>
      </div>
    </>
  );
}
