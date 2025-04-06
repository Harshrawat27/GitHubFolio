'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CommitActivity } from '@/types';
import { createGitHubHeaders } from '@/lib/githubToken';

interface ActivityGraphProps {
  username: string;
  token: string | null;
}

export default function ActivityGraph({ username, token }: ActivityGraphProps) {
  const [activityData, setActivityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActivityData = async () => {
      setLoading(true);
      setError('');

      try {
        // Use createGitHubHeaders to get headers with the appropriate token
        const headers = createGitHubHeaders();

        // First, fetch all user repositories
        const reposResponse = await fetch(
          `https://api.github.com/users/${username}/repos?sort=pushed&per_page=10`,
          { headers }
        );

        if (!reposResponse.ok) {
          throw new Error(
            `Failed to fetch repositories: ${reposResponse.status}`
          );
        }

        const repos = await reposResponse.json();

        if (repos.length === 0) {
          setActivityData([]);
          setLoading(false);
          return;
        }

        // Find most recent non-fork repositories with commits
        const nonForkRepos = repos.filter((repo: any) => !repo.fork);

        if (nonForkRepos.length === 0) {
          // Fallback to any repo if no non-fork repos
          setActivityData([]);
          setLoading(false);
          return;
        }

        // Try to fetch activity for repos one by one until we get data
        let commitData: any = null;

        for (let i = 0; i < Math.min(nonForkRepos.length, 3); i++) {
          const repo = nonForkRepos[i];

          try {
            // Try to get participation stats
            const participationResponse = await fetch(
              `https://api.github.com/repos/${repo.full_name}/stats/participation`,
              { headers }
            );

            if (participationResponse.ok) {
              const data = await participationResponse.json();

              if (
                data &&
                data.owner &&
                data.owner.some((val: number) => val > 0)
              ) {
                // Found a repo with owner participation
                commitData = {
                  repo: repo.name,
                  data: data.owner,
                };
                break;
              }
            }
          } catch (err) {
            console.error(`Error fetching stats for ${repo.name}:`, err);
            // Continue to next repo
          }
        }

        if (!commitData) {
          // If no commit data, show simpler representation using push dates
          const activityMap: { [key: string]: number } = {};

          // Create a map of dates with commit counts
          repos.forEach((repo: any) => {
            const pushDate = new Date(repo.pushed_at);
            const dateKey = `${pushDate.getFullYear()}-${String(
              pushDate.getMonth() + 1
            ).padStart(2, '0')}`;

            activityMap[dateKey] = (activityMap[dateKey] || 0) + 1;
          });

          // Convert to array and sort by date
          const formattedData = Object.keys(activityMap)
            .sort()
            .map((dateKey) => {
              const [year, month] = dateKey.split('-');
              return {
                name: `${month}/${year.slice(2)}`,
                commits: activityMap[dateKey],
                date: dateKey,
              };
            })
            .slice(-12); // Last 12 months

          setActivityData(formattedData);
        } else {
          // Format the participation data
          const formattedData = commitData.data.map(
            (count: number, index: number) => {
              // Calculate the date by going back from current date
              const date = new Date();
              date.setDate(
                date.getDate() - (commitData.data.length - 1 - index) * 7
              );

              return {
                name: `Week ${index + 1}`,
                commits: count,
                date: `${date.getMonth() + 1}/${date.getDate()}`,
              };
            }
          );

          setActivityData(
            formattedData.filter((item: any) => item.commits > 0)
          );
        }
      } catch (error) {
        console.error('Failed to load activity data:', error);
        setError('Failed to load activity data');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchActivityData();
    }
  }, [username, token]);

  // Rest of the component...

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-[#191919] border border-[#222222] px-3 py-2 rounded-md shadow-md'>
          <p className='font-mono text-sm text-[#8976EA]'>{`${label}`}</p>
          <p className='text-xs text-gray-300'>{`Commits: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className='card'>
      <h2 className='text-xl font-bold mb-6 flex items-center gap-2'>
        <span className='w-1 h-6 bg-[#8976EA] rounded-md'></span>
        Commit Activity
      </h2>

      {loading ? (
        <div className='h-64 flex items-center justify-center'>
          <div className='animate-spin h-8 w-8 border-2 border-[#8976EA] rounded-full border-t-transparent'></div>
        </div>
      ) : error ? (
        <div className='h-64 flex items-center justify-center text-red-400'>
          {error}
        </div>
      ) : activityData.length === 0 ? (
        <div className='h-64 flex items-center justify-center text-gray-500'>
          <div className='text-center'>
            <p>No activity data available</p>
            <p className='text-sm mt-2 text-gray-600'>
              Try refreshing the page or check a different profile
            </p>
          </div>
        </div>
      ) : (
        <div className='h-64'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={activityData}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='#222222'
                vertical={false}
              />
              <XAxis
                dataKey='date'
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={{ stroke: '#333333' }}
              />
              <YAxis
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                allowDecimals={false}
                axisLine={{ stroke: '#333333' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type='monotone'
                dataKey='commits'
                stroke='#8976EA'
                strokeWidth={2}
                dot={{
                  r: 4,
                  strokeWidth: 2,
                  fill: '#191919',
                  stroke: '#8976EA',
                }}
                activeDot={{ r: 6, strokeWidth: 2, fill: '#8976EA' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className='mt-4 text-xs text-gray-500'>
        {activityData.length > 0 ? (
          <p>Showing commit activity based on repository activity.</p>
        ) : !loading && !error ? (
          <p>
            No recent commit activity found. This could be because the
            repository is new or private.
          </p>
        ) : null}
      </div>
    </div>
  );
}
