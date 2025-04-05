'use client';

import { useState, useEffect } from 'react';
import { GitHubUser, Repository } from '@/types';
import Image from 'next/image';

interface SimilarProfilesProps {
  user: GitHubUser;
  repos: Repository[];
  token: string | null;
  onProfileSelect: (username: string) => void;
}

interface SimilarUser {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  similarity_reason: string;
}

export default function SimilarProfiles({
  user,
  repos,
  token,
  onProfileSelect,
}: SimilarProfilesProps) {
  const [similarUsers, setSimilarUsers] = useState<SimilarUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const findSimilarProfiles = async () => {
      setLoading(true);
      setError('');

      try {
        // Create headers with token if available
        const headers: HeadersInit = {};
        if (token) {
          headers.Authorization = `token ${token}`;
        }

        // Get languages used by the current user
        const userLanguages = new Set<string>();
        repos.forEach((repo) => {
          if (repo.language) {
            userLanguages.add(repo.language);
          }
        });

        // Get topics used by the current user
        const userTopics = new Set<string>();
        repos.forEach((repo) => {
          if (repo.topics && repo.topics.length) {
            repo.topics.forEach((topic) => userTopics.add(topic));
          }
        });

        // If no languages or topics, we can't find similar users
        if (userLanguages.size === 0 && userTopics.size === 0) {
          setSimilarUsers([]);
          setLoading(false);
          return;
        }

        // Get the primary language (most used)
        const languageCounts: Record<string, number> = {};
        repos.forEach((repo) => {
          if (repo.language) {
            languageCounts[repo.language] =
              (languageCounts[repo.language] || 0) + 1;
          }
        });

        const primaryLanguage = Object.entries(languageCounts)
          .sort(([, countA], [, countB]) => countB - countA)
          .map(([language]) => language)[0];

        // Strategy 1: Search for users with similar repositories
        // Find users who have starred the same repos or have repos with similar topics
        const similarUsersSet = new Map<string, SimilarUser>();

        // Method 1: Find users based on similar language
        if (primaryLanguage) {
          // Search for repositories in the same primary language
          const langReposResponse = await fetch(
            `https://api.github.com/search/repositories?q=language:${primaryLanguage}+stars:>10&sort=stars&per_page=5`,
            { headers }
          );

          if (langReposResponse.ok) {
            const langReposData = await langReposResponse.json();

            // Get contributors to these repos
            for (const repo of langReposData.items.slice(0, 3)) {
              try {
                const contributorsResponse = await fetch(
                  repo.contributors_url,
                  { headers }
                );

                if (contributorsResponse.ok) {
                  const contributors = await contributorsResponse.json();

                  // Add contributors as similar users
                  for (const contributor of contributors.slice(0, 5)) {
                    // Skip the current user
                    if (contributor.login === user.login) continue;

                    if (!similarUsersSet.has(contributor.login)) {
                      similarUsersSet.set(contributor.login, {
                        login: contributor.login,
                        avatar_url: contributor.avatar_url,
                        html_url: contributor.html_url,
                        name: null,
                        similarity_reason: `Also works with ${primaryLanguage}`,
                      });
                    }
                  }
                }
              } catch (error) {
                console.error('Error fetching contributors:', error);
              }
            }
          }
        }

        // Method 2: Find users who have repositories with similar topics
        if (userTopics.size > 0) {
          // Take up to 3 topics
          const topics = Array.from(userTopics).slice(0, 3).join('+');

          const topicReposResponse = await fetch(
            `https://api.github.com/search/repositories?q=topic:${topics}+stars:>5&sort=stars&per_page=5`,
            { headers }
          );

          if (topicReposResponse.ok) {
            const topicReposData = await topicReposResponse.json();

            // Get owners of these repos
            for (const repo of topicReposData.items) {
              // Skip the current user
              if (repo.owner.login === user.login) continue;

              if (!similarUsersSet.has(repo.owner.login)) {
                similarUsersSet.set(repo.owner.login, {
                  login: repo.owner.login,
                  avatar_url: repo.owner.avatar_url,
                  html_url: repo.owner.html_url,
                  name: null,
                  similarity_reason: `Works on similar topics`,
                });
              }
            }
          }
        }

        // Method 3: Find users who follow the current user's followers
        if (user.followers > 0) {
          const followersResponse = await fetch(
            `https://api.github.com/users/${user.login}/followers?per_page=5`,
            { headers }
          );

          if (followersResponse.ok) {
            const followers = await followersResponse.json();

            for (const follower of followers) {
              // Get who this follower follows
              try {
                const followerFollowingResponse = await fetch(
                  `https://api.github.com/users/${follower.login}/following?per_page=5`,
                  { headers }
                );

                if (followerFollowingResponse.ok) {
                  const followerFollowing =
                    await followerFollowingResponse.json();

                  for (const following of followerFollowing) {
                    // Skip the current user
                    if (following.login === user.login) continue;

                    if (!similarUsersSet.has(following.login)) {
                      similarUsersSet.set(following.login, {
                        login: following.login,
                        avatar_url: following.avatar_url,
                        html_url: following.html_url,
                        name: null,
                        similarity_reason: `Followed by people who follow you`,
                      });
                    }
                  }
                }
              } catch (error) {
                console.error('Error fetching follower following:', error);
              }
            }
          }
        }

        // Convert map to array and limit to 6 users
        const similarUsersArray = Array.from(similarUsersSet.values());

        // Get additional details for each user
        const enhancedUsers = await Promise.all(
          similarUsersArray.slice(0, 6).map(async (simUser) => {
            try {
              const userResponse = await fetch(
                `https://api.github.com/users/${simUser.login}`,
                { headers }
              );

              if (userResponse.ok) {
                const userData = await userResponse.json();
                return {
                  ...simUser,
                  name: userData.name,
                };
              }

              return simUser;
            } catch (error) {
              console.error(
                `Error fetching details for ${simUser.login}:`,
                error
              );
              return simUser;
            }
          })
        );

        setSimilarUsers(enhancedUsers);
      } catch (error) {
        console.error('Error finding similar profiles:', error);
        setError('Failed to find similar profiles');
      } finally {
        setLoading(false);
      }
    };

    if (user && repos.length > 0) {
      findSimilarProfiles();
    }
  }, [user, repos, token]);

  return (
    <div className='bg-white p-6 rounded-lg shadow-md'>
      <h2 className='text-xl font-semibold mb-4'>Similar GitHub Profiles</h2>

      {loading ? (
        <div className='py-8 flex items-center justify-center'>
          <div className='animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent'></div>
        </div>
      ) : error ? (
        <div className='text-red-500 py-4'>{error}</div>
      ) : similarUsers.length === 0 ? (
        <div className='text-gray-500 py-4'>
          No similar profiles found. This could be due to API rate limits or
          insufficient data.
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
          {similarUsers.map((simUser) => (
            <div
              key={simUser.login}
              className='border rounded-lg p-4 flex flex-col items-center hover:bg-blue-50 cursor-pointer'
              onClick={() => onProfileSelect(simUser.login)}
            >
              <Image
                src={simUser.avatar_url}
                alt={simUser.login}
                width={80}
                height={80}
                className='rounded-full border-2 border-gray-200'
              />
              <h3 className='font-medium mt-2'>
                {simUser.name || simUser.login}
              </h3>
              <p className='text-sm text-gray-500'>@{simUser.login}</p>
              <p className='text-xs text-gray-600 mt-2 text-center'>
                {simUser.similarity_reason}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className='mt-4 text-xs text-gray-500'>
        <p>
          Similar profiles are suggested based on common languages, topics, and
          social connections. Click on a profile to explore it.
        </p>
      </div>
    </div>
  );
}
