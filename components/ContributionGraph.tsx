// components/ContributionGraph.tsx
'use client';

import { useState, useEffect } from 'react';
import { createGitHubHeaders } from '@/lib/githubToken';

interface ContributionGraphProps {
  username: string;
  token: string | null;
}

interface ContributionDay {
  date: string;
  count: number;
}

interface CalendarData {
  days: ContributionDay[];
  months: string[];
  totalContributions: number;
}

export default function ContributionGraph({
  username,
  token,
}: ContributionGraphProps) {
  const [contributions, setContributions] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const fetchContributions = async () => {
      setLoading(true);
      setError('');

      try {
        // Create headers with token if available
        const headers = createGitHubHeaders();

        // Fetch contribution data - unfortunately, standard REST API doesn't provide this data
        // We'd need the GraphQL API for actual contribution data
        // This is a simplified approach using repository activity as a proxy

        const now = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);

        // Fetch user's repositories
        const reposResponse = await fetch(
          `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`,
          { headers }
        );

        if (!reposResponse.ok) {
          throw new Error(
            `Failed to fetch repositories: ${reposResponse.status}`
          );
        }

        const repos = await reposResponse.json();

        // We'll simulate contribution data based on repository push dates
        // Initialize an empty calendar with the past 365 days
        const days: ContributionDay[] = [];
        const activityMap: Record<string, number> = {};

        // Create an array of dates for the past year
        for (let i = 0; i < 365; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          activityMap[dateStr] = 0;
        }

        // For each repository, count its pushed_at date as activity
        for (const repo of repos) {
          const pushDate = new Date(repo.pushed_at);
          // Only count if it's within the last year
          if (pushDate >= oneYearAgo && pushDate <= now) {
            const dateStr = pushDate.toISOString().split('T')[0];
            activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
          }
        }

        // Convert to the format we need for rendering
        Object.keys(activityMap)
          .sort()
          .forEach((date) => {
            days.push({
              date,
              count: activityMap[date],
            });
          });

        // Determine months for the calendar
        const months: string[] = [];
        const monthNames = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];

        for (let i = 0; i < 12; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          months.unshift(monthNames[date.getMonth()]);
        }

        // Calculate total contributions
        const totalContributions = Object.values(activityMap).reduce(
          (sum, count) => sum + count,
          0
        );

        setContributions({
          days,
          months,
          totalContributions,
        });
      } catch (error) {
        console.error('Error fetching contributions:', error);
        setError('Failed to load contribution data');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchContributions();
    }
  }, [username, token]);

  // Helper to get color based on contribution count
  const getContributionColor = (count: number) => {
    if (count === 0) return 'bg-[var(--card-bg)]';
    if (count === 1) return 'bg-[#553F9A]';
    if (count <= 3) return 'bg-[#6F5BD0]';
    if (count <= 5) return 'bg-[#8976EA]';
    return 'bg-[#A595F0]';
  };

  // Create a 7x52 grid for the contribution graph (7 days per week, 52 weeks)
  const generateCalendarGrid = () => {
    if (!contributions) return null;

    const { days } = contributions;
    const weeks = [];
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Generate a calendar grid with proper weekday alignment
    for (let week = 0; week < 52; week++) {
      const currentWeek = [];

      for (let day = 0; day < 7; day++) {
        const index = days.length - 1 - (week * 7 + (6 - day));
        if (index >= 0 && index < days.length) {
          currentWeek.push({
            date: days[index].date,
            count: days[index].count,
            day,
          });
        } else {
          currentWeek.push({ date: '', count: 0, day });
        }
      }

      weeks.push(currentWeek);
    }

    return (
      <div className='flex overflow-x-auto pb-4 scrollbar-thin'>
        <div className='mr-2 text-xs text-[var(--text-secondary)] flex flex-col justify-around h-[110px] pt-[10px]'>
          {['Mon', '', 'Wed', '', 'Fri', ''].map((day, index) => (
            <div key={index} className='h-3 flex items-center'>
              {day}
            </div>
          ))}
        </div>
        <div>
          <div className='flex text-xs text-[var(--text-secondary)] mb-1 px-1'>
            {contributions.months.map((month, index) => (
              <div key={index} className='w-[14px] mx-[2px]'>
                {/* Approximate month position */}
                {index % 2 === 0 ? month : ''}
              </div>
            ))}
          </div>
          <div className='flex'>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className='flex flex-col'>
                {week.map((day) => (
                  <div
                    key={day.date || `empty-${day.day}-${weekIndex}`}
                    className={`w-3 h-3 m-[1px] rounded-sm ${getContributionColor(
                      day.count
                    )} hover:ring-1 hover:ring-[var(--text-primary)] transition-all duration-150`}
                    title={
                      day.date ? `${day.date}: ${day.count} contributions` : ''
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='relative'>
      <div className='flex justify-between items-center mb-6'>
        <div className='text-lg font-medium'>
          {contributions ? (
            <span>
              {contributions.totalContributions} contributions in the last year
            </span>
          ) : null}
        </div>

        <div className='flex border border-[var(--card-border)] rounded overflow-hidden'>
          <button
            onClick={() => setYear(new Date().getFullYear())}
            className={`px-3 py-1 text-sm ${
              year === new Date().getFullYear()
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--background)]'
            }`}
          >
            {new Date().getFullYear()}
          </button>
          <button
            onClick={() => setYear(new Date().getFullYear() - 1)}
            className={`px-3 py-1 text-sm ${
              year === new Date().getFullYear() - 1
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--background)]'
            }`}
          >
            {new Date().getFullYear() - 1}
          </button>
        </div>
      </div>

      {loading ? (
        <div className='py-8 flex items-center justify-center'>
          <div className='relative'>
            <div className='animate-spin h-8 w-8 border-2 border-[var(--primary)] rounded-full border-t-transparent'></div>
            <div className='absolute inset-0 m-auto w-1.5 h-1.5 bg-[var(--primary)] rounded-full'></div>
          </div>
        </div>
      ) : error ? (
        <div className='text-red-400 py-4'>{error}</div>
      ) : contributions ? (
        <div>
          <div className='border border-[var(--card-border)] rounded-lg p-4'>
            {generateCalendarGrid()}

            <div className='flex items-center justify-end mt-2 text-xs text-[var(--text-secondary)]'>
              <span className='mr-2'>Less</span>
              <div className='flex items-center gap-[3px]'>
                <div className='w-3 h-3 bg-[var(--card-bg)] rounded-sm'></div>
                <div className='w-3 h-3 bg-[#553F9A] rounded-sm'></div>
                <div className='w-3 h-3 bg-[#6F5BD0] rounded-sm'></div>
                <div className='w-3 h-3 bg-[#8976EA] rounded-sm'></div>
                <div className='w-3 h-3 bg-[#A595F0] rounded-sm'></div>
              </div>
              <span className='ml-2'>More</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Decorative elements */}
      <div className='absolute -right-4 top-0 text-xs font-mono text-[var(--text-secondary)] opacity-70'>
        #02
      </div>
    </div>
  );
}
