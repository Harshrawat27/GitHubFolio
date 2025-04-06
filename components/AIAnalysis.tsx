// components/AIAnalysis.tsx
'use client';

import { useState, useEffect } from 'react';
import { Repository, GitHubUser } from '@/types';

interface AIAnalysisProps {
  user: GitHubUser;
  repos: Repository[];
}

export default function AIAnalysis({ user, repos }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const generateAnalysis = async () => {
      setLoading(true);
      setError('');

      try {
        // Prepare data for analysis
        const userData = {
          login: user.login,
          name: user.name,
          bio: user.bio,
          followers: user.followers,
          following: user.following,
          public_repos: user.public_repos,
          created_at: user.created_at,
        };

        const repoData = repos.map((repo) => ({
          name: repo.name,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          created_at: repo.created_at,
          updated_at: repo.updated_at,
          pushed_at: repo.pushed_at,
        }));

        // Get language statistics
        const languages: { [key: string]: number } = {};
        repos.forEach((repo) => {
          if (repo.language) {
            languages[repo.language] = (languages[repo.language] || 0) + 1;
          }
        });

        // Calculate activity patterns
        const activityByMonth: { [key: string]: number } = {};
        repos.forEach((repo) => {
          const pushDate = new Date(repo.pushed_at);
          const monthKey = `${pushDate.getFullYear()}-${String(
            pushDate.getMonth() + 1
          ).padStart(2, '0')}`;
          activityByMonth[monthKey] = (activityByMonth[monthKey] || 0) + 1;
        });

        // Sort languages by frequency
        const topLanguages = Object.entries(languages)
          .sort(([, a], [, b]) => b - a)
          .map(([language]) => language);

        // Determine most active periods
        const activityEntries = Object.entries(activityByMonth).sort(
          ([dateA], [dateB]) => dateA.localeCompare(dateB)
        );

        const activityTrend =
          activityEntries.length > 1
            ? activityEntries.slice(-3).map(([, count]) => count)
            : [];

        // Calculate total stars
        const totalStars = repos.reduce(
          (sum, repo) => sum + repo.stargazers_count,
          0
        );

        // Calculate days since last activity
        const lastPush = new Date(
          Math.max(...repos.map((repo) => new Date(repo.pushed_at).getTime()))
        );
        const daysSinceLastActivity = Math.floor(
          (new Date().getTime() - lastPush.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Generate insights based on the data
        let aiAnalysis = '';

        // Language expertise
        if (topLanguages.length > 0) {
          aiAnalysis += `**Language Expertise**: ${
            topLanguages[0]
          } appears to be ${
            user.name || user.login
          }'s primary programming language, `;

          if (topLanguages.length > 1) {
            aiAnalysis += `with proficiency in ${topLanguages
              .slice(1, 3)
              .join(', ')}`;
            if (topLanguages.length > 3) {
              aiAnalysis += ` and other languages`;
            }
          }

          aiAnalysis += '.\n\n';
        }

        // Activity assessment
        if (daysSinceLastActivity <= 7) {
          aiAnalysis +=
            '**Activity Level**: Very active developer with recent contributions.\n\n';
        } else if (daysSinceLastActivity <= 30) {
          aiAnalysis +=
            '**Activity Level**: Moderately active developer with contributions this month.\n\n';
        } else if (daysSinceLastActivity <= 90) {
          aiAnalysis +=
            '**Activity Level**: Occasionally active developer with contributions in the past quarter.\n\n';
        } else {
          aiAnalysis +=
            '**Activity Level**: Less active recently, with the last contribution some time ago.\n\n';
        }

        // Project focus
        const hasLargeRepos = repos.some((repo) => repo.stargazers_count > 10);
        if (hasLargeRepos) {
          aiAnalysis +=
            '**Project Impact**: Has created notable projects with community interest.\n\n';
        } else if (repos.length > 10) {
          aiAnalysis +=
            '**Project Diversity**: Demonstrates diverse coding interests across multiple repositories.\n\n';
        } else {
          aiAnalysis +=
            '**Project Status**: Focused on fewer, specific projects or newer to GitHub.\n\n';
        }

        // Engagement style
        if (user.followers > 10) {
          aiAnalysis +=
            '**Community Engagement**: Has a following in the developer community.\n\n';
        }

        if (repos.some((repo) => repo.fork)) {
          aiAnalysis +=
            '**Collaboration Style**: Actively contributes to or builds upon other projects.\n\n';
        }

        // Activity trend
        if (activityTrend.length === 3) {
          if (activityTrend[2] > activityTrend[0]) {
            aiAnalysis +=
              '**Activity Trend**: Increasing GitHub activity over recent months.\n\n';
          } else if (activityTrend[2] < activityTrend[0]) {
            aiAnalysis +=
              '**Activity Trend**: Decreasing GitHub activity in recent months.\n\n';
          } else {
            aiAnalysis +=
              '**Activity Trend**: Consistent GitHub activity level in recent months.\n\n';
          }
        }

        // Account maturity
        const accountCreation = new Date(user.created_at);
        const accountAgeYears = Math.floor(
          (new Date().getTime() - accountCreation.getTime()) /
            (1000 * 60 * 60 * 24 * 365)
        );

        if (accountAgeYears >= 5) {
          aiAnalysis += `**Account Maturity**: Experienced GitHub user with an account over ${accountAgeYears} years old.\n\n`;
        } else if (accountAgeYears >= 1) {
          aiAnalysis += `**Account Maturity**: Established GitHub user with an account ${accountAgeYears} ${
            accountAgeYears === 1 ? 'year' : 'years'
          } old.\n\n`;
        } else {
          aiAnalysis +=
            '**Account Maturity**: Newer GitHub user with an account less than a year old.\n\n';
        }

        // Summary
        aiAnalysis += '**Summary**: ';

        if (totalStars > 50) {
          aiAnalysis += `An impactful developer with ${totalStars}+ stars across their projects. `;
        } else if (totalStars > 10) {
          aiAnalysis += `A developer with growing recognition (${totalStars} stars). `;
        } else {
          aiAnalysis += `A developer focused on personal or specialized projects. `;
        }

        if (daysSinceLastActivity <= 30) {
          aiAnalysis += `Currently active on GitHub. `;
        }

        if (topLanguages.length > 0) {
          aiAnalysis += `Shows strongest skills in ${topLanguages[0]}. `;
        }

        setAnalysis(aiAnalysis);
      } catch (error) {
        console.error('Error generating AI analysis:', error);
        setError('Failed to generate AI insights');
      } finally {
        setLoading(false);
      }
    };

    if (user && repos.length > 0) {
      generateAnalysis();
    }
  }, [user, repos]);

  return (
    <div className='card'>
      {loading ? (
        <div className='py-8 flex items-center justify-center'>
          <div className='flex flex-col items-center'>
            <div className='relative'>
              <div className='animate-spin h-8 w-8 border-2 border-[var(--primary)] rounded-full border-t-transparent'></div>
              <div className='absolute inset-0 m-auto w-1.5 h-1.5 bg-[var(--primary)] rounded-full'></div>
            </div>
            <p className='text-[var(--text-secondary)] mt-4'>
              Analyzing developer profile...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className='text-red-400 py-4'>{error}</div>
      ) : (
        <div className='space-y-6'>
          {analysis.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('**')) {
              const [title, content] = paragraph.split('**: ');
              return (
                <div
                  key={index}
                  className='bg-[var(--background)] border border-[var(--card-border)] rounded-md p-4 hover:border-[var(--primary)] hover:border-opacity-30 transition-all duration-300 relative group'
                >
                  <h3 className='text-lg font-medium text-[var(--primary)] mb-2'>
                    {title.replace(/\*\*/g, '')}
                  </h3>
                  <p className='text-[var(--text-secondary)] text-sm leading-relaxed'>
                    {content}
                  </p>
                  <div className='absolute right-4 top-4 w-1.5 h-1.5 rounded-full bg-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity'></div>
                </div>
              );
            }
            return (
              <p key={index} className='text-[var(--text-secondary)]'>
                {paragraph}
              </p>
            );
          })}
        </div>
      )}

      <div className='mt-6 pt-4 border-t border-[var(--card-border)] text-xs text-[var(--text-secondary)] opacity-70'>
        <p>
          This analysis is generated using AI based on public GitHub data and
          provides general insights about the developer profile.
        </p>
      </div>
    </div>
  );
}
