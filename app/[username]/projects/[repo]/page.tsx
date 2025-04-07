// app/[username]/projects/[repo]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import SideNav from '@/components/SideNav';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { createGitHubHeaders } from '@/lib/githubToken';

// Interface for repository details
interface RepoDetails {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
    url: string;
  } | null;
  topics: string[];
  visibility: string;
  default_branch: string;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
  };
  subscribers_count?: number;
  network_count?: number;
  readme?: string;
  languages?: Record<string, number>;
}

interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const repoName = params.repo as string;

  const [repoData, setRepoData] = useState<RepoDetails | null>(null);
  const [readme, setReadme] = useState<string>('');
  const [projectReadme, setProjectReadme] = useState<string>('');
  const [viewMode, setViewMode] = useState<'technical' | 'project'>(
    'technical'
  );
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [languages, setLanguages] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);

  // Check for token in localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('github_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch repository data
  useEffect(() => {
    const fetchRepoData = async () => {
      if (!username || !repoName) return;

      setLoading(true);
      setError('');

      try {
        const headers = createGitHubHeaders();

        // Fetch repo details
        const repoResponse = await fetch(
          `https://api.github.com/repos/${username}/${repoName}`,
          { headers }
        );
        if (!repoResponse.ok) {
          throw new Error(`Repository not found (${repoResponse.status})`);
        }
        const repoData = await repoResponse.json();
        setRepoData(repoData);

        // Fetch README
        try {
          const readmeResponse = await fetch(
            `https://api.github.com/repos/${username}/${repoName}/readme`,
            { headers }
          );
          if (readmeResponse.ok) {
            const readmeData = await readmeResponse.json();
            const content = readmeData.content;
            const byteCharacters = atob(content.replace(/\s/g, ''));
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const decodedContent = new TextDecoder('utf-8').decode(byteArray);
            setReadme(decodedContent);
          }
        } catch (error) {
          console.error('Error fetching README:', error);
        }

        // Commented out fetching logic for GitHubFolio.md to improve load time
        /*
        // Try fetching GitHubFolio.md with multiple variations
        const tryFetchProjectReadme = async (path: string) => {
          try {
            const projectReadmeResponse = await fetch(
              `https://api.github.com/repos/${username}/${repoName}/contents/${path}`,
              { headers }
            );
            if (projectReadmeResponse.ok) {
              const projectReadmeData = await projectReadmeResponse.json();
              const content = projectReadmeData.content;
              const byteCharacters = atob(content.replace(/\s/g, ''));
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const decodedContent = new TextDecoder('utf-8').decode(byteArray);
              setProjectReadme(decodedContent);
              setViewMode('project');
              return true;
            }
            return false;
          } catch (error) {
            console.error(`Error fetching ${path}:`, error);
            return false;
          }
        };

        const fileNameVariations = [
          'GitHubFolio.md',
          'GITHUBFOLIO.md',
          'githubfolio.md',
          'docs/GitHubFolio.md',
          'docs/githubfolio.md',
          '.github/GitHubFolio.md',
          '.github/githubfolio.md',
          'PROJECT.md',
          'project.md',
          'docs/PROJECT.md',
          'docs/project.md',
        ];

        for (const fileName of fileNameVariations) {
          const found = await tryFetchProjectReadme(fileName);
          if (found) break;
        }
        */

        // Fetch contributors
        try {
          const contributorsResponse = await fetch(
            `https://api.github.com/repos/${username}/${repoName}/contributors?per_page=10`,
            { headers }
          );
          if (contributorsResponse.ok) {
            const contributorsData = await contributorsResponse.json();
            setContributors(contributorsData);
          }
        } catch (error) {
          console.error('Error fetching contributors:', error);
        }

        // Fetch languages
        try {
          const languagesResponse = await fetch(
            `https://api.github.com/repos/${username}/${repoName}/languages`,
            { headers }
          );
          if (languagesResponse.ok) {
            const languagesData = await languagesResponse.json();
            setLanguages(languagesData);
          }
        } catch (error) {
          console.error('Error fetching languages:', error);
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(`Error: ${error.message}`);
        } else {
          setError('Error fetching repository data');
        }
        setRepoData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRepoData();
  }, [username, repoName, token]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate language percentages
  const calculateLanguagePercentages = () => {
    const total = Object.values(languages).reduce(
      (sum, value) => sum + value,
      0
    );
    return Object.entries(languages).map(([language, bytes]) => ({
      language,
      percentage: Math.round((bytes / total) * 100),
      bytes,
    }));
  };

  // Helper function to get color for language
  const getLanguageColor = (language: string): string => {
    const colors: Record<string, string> = {
      JavaScript: '#f1e05a',
      TypeScript: '#3178c6',
      HTML: '#e34c26',
      CSS: '#563d7c',
      Python: '#3572A5',
      Java: '#b07219',
      Ruby: '#701516',
      PHP: '#4F5D95',
      Go: '#00ADD8',
      Rust: '#dea584',
      C: '#555555',
      'C++': '#f34b7d',
      'C#': '#178600',
      Swift: '#ffac45',
      Kotlin: '#A97BFF',
      Dart: '#00B4AB',
      Shell: '#89e051',
      Vue: '#41b883',
    };
    return colors[language] || '#8b949e';
  };

  // Custom renderer for images to handle GitHub relative URLs
  const transformImageUri = (src: string) => {
    if (src.startsWith('http')) {
      return src;
    }
    const repoBaseUrl = `https://raw.githubusercontent.com/${username}/${repoName}/${
      repoData?.default_branch || 'main'
    }`;
    const cleanSrc = src.startsWith('/') ? src.substring(1) : src;
    return `${repoBaseUrl}/${cleanSrc}`;
  };

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <div className='relative w-16 h-16'>
          <div className='absolute inset-0 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin'></div>
          <div className='absolute inset-0 m-auto w-2 h-2 bg-[var(--primary)] rounded-full'></div>
        </div>
        <h2 className='text-xl font-bold mt-8 mb-2 font-mono'>
          Loading project...
        </h2>
        <p className='text-[var(--text-secondary)] max-w-md text-center'>
          We're fetching project details from GitHub.
        </p>
      </div>
    );
  }

  if (error || !repoData) {
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
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
            />
          </svg>
        </div>
        <h2 className='text-2xl font-bold mb-2'>Project Not Found</h2>
        <p className='text-[var(--text-secondary)] mb-6'>
          {error || "Couldn't load this project"}
        </p>
        <Link
          href={`/${username}`}
          className='px-6 py-2 bg-[var(--primary)] rounded-full text-white'
        >
          Back to Profile
        </Link>
      </div>
    );
  }

  return (
    <>
      <SideNav username={username} />
      <div className='flex flex-col pb-32 pt-8 relative'>
        {/* Date indicator */}
        <div className='date-marker top-8 right-0'>
          {new Date().toISOString().split('T')[0]}
        </div>

        {/* Back button and repo link */}
        <div className='flex justify-between items-center mb-8'>
          <Link
            href={`/${username}/projects`}
            className='text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
                clipRule='evenodd'
              />
            </svg>
            Back to projects
          </Link>
          <a
            href={repoData.html_url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-[var(--primary)] hover:underline flex items-center gap-1 group'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-4 w-4 group-hover:translate-x-1 transition-transform'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
            <span>View on GitHub</span>
          </a>
        </div>

        {/* Project header */}
        <div className='mb-12 relative'>
          <div className='flex items-start gap-2 mb-2'>
            {repoData.language && (
              <span
                className='h-3 w-3 rounded-full inline-block mt-3'
                style={{ backgroundColor: getLanguageColor(repoData.language) }}
              ></span>
            )}
            <h1 className='text-4xl font-bold title-gradient'>
              {repoData.name}
            </h1>
          </div>
          <div className='flex flex-wrap items-center gap-3 mb-3'>
            <span className='date-indicator'>
              {new Date(repoData.created_at)
                .toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric',
                })
                .toUpperCase()}
            </span>
            {repoData.language && (
              <span className='bg-[var(--background)] px-2 py-0.5 rounded-full text-xs text-[var(--text-secondary)]'>
                {repoData.language}
              </span>
            )}
            {repoData.fork && (
              <span className='bg-[var(--background)] px-2 py-0.5 rounded-full text-xs text-[var(--text-secondary)]'>
                Forked
              </span>
            )}
          </div>
          {repoData.description && (
            <p className='text-[var(--text-secondary)] text-lg mb-6'>
              {repoData.description}
            </p>
          )}
          <div className='flex flex-wrap gap-5 mt-6 mb-4'>
            <div className='flex items-center gap-2 bg-[var(--card-bg)] px-4 py-2 rounded-lg border border-[var(--card-border)]'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 text-yellow-400'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
              </svg>
              <span>{repoData.stargazers_count} stars</span>
            </div>
            <div className='flex items-center gap-2 bg-[var(--card-bg)] px-4 py-2 rounded-lg border border-[var(--card-border)]'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 text-[var(--text-secondary)]'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                  clipRule='evenodd'
                />
              </svg>
              <span>{repoData.forks_count} forks</span>
            </div>
            <div className='flex items-center gap-2 bg-[var(--card-bg)] px-4 py-2 rounded-lg border border-[var(--card-border)]'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 text-[var(--text-secondary)]'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path d='M10 12a2 2 0 100-4 2 2 0 000 4z' />
                <path
                  fillRule='evenodd'
                  d='M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z'
                  clipRule='evenodd'
                />
              </svg>
              <span>{repoData.watchers_count} watchers</span>
            </div>
            <div className='flex items-center gap-2 bg-[var(--card-bg)] px-4 py-2 rounded-lg border border-[var(--card-border)]'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 text-[var(--text-secondary)]'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                  clipRule='evenodd'
                />
              </svg>
              <span>Updated {formatDate(repoData.updated_at)}</span>
            </div>
          </div>
          {repoData.topics && repoData.topics.length > 0 && (
            <div className='flex flex-wrap gap-2 my-4'>
              {repoData.topics.map((topic) => (
                <span
                  key={topic}
                  className='px-3 py-1 bg-[var(--background)] rounded-full text-sm text-[var(--text-secondary)]'
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
          <div className='absolute -right-4 top-0 text-xs font-mono text-[var(--text-secondary)] opacity-70'>
            #05
          </div>
        </div>

        {/* Languages */}
        {Object.keys(languages).length > 0 && (
          <div className='mb-12'>
            <h2 className='section-heading'>Languages</h2>
            <div className='h-4 bg-[var(--card-bg)] rounded-full overflow-hidden mb-4'>
              {calculateLanguagePercentages().map(
                ({ language, percentage }, index) => (
                  <div
                    key={language}
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: getLanguageColor(language),
                      height: '100%',
                      float: 'left',
                    }}
                    title={`${language}: ${percentage}%`}
                  ></div>
                )
              )}
            </div>
            <div className='flex flex-wrap gap-x-6 gap-y-2'>
              {calculateLanguagePercentages().map(
                ({ language, percentage }) => (
                  <div key={language} className='flex items-center gap-2'>
                    <span
                      className='h-3 w-3 rounded-full'
                      style={{ backgroundColor: getLanguageColor(language) }}
                    ></span>
                    <span className='text-[var(--text-primary)]'>
                      {language}{' '}
                      <span className='text-[var(--text-secondary)] text-sm'>
                        {percentage}%
                      </span>
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Contributors */}
        {contributors.length > 0 && (
          <div className='mb-12'>
            <h2 className='section-heading'>Contributors</h2>
            <div className='flex flex-wrap gap-4'>
              {contributors.map((contributor) => (
                <a
                  key={contributor.login}
                  href={contributor.html_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex flex-col items-center hover:scale-105 transition-transform'
                >
                  <div className='w-16 h-16 relative rounded-full overflow-hidden border border-[var(--card-border)] mb-2 bg-[var(--card-bg)]'>
                    <Image
                      src={contributor.avatar_url}
                      alt={contributor.login}
                      fill
                      className='object-cover'
                    />
                  </div>
                  <span className='text-sm font-mono text-[var(--primary)]'>
                    {contributor.login}
                  </span>
                  <span className='text-xs text-[var(--text-secondary)]'>
                    {contributor.contributions} commits
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Documentation */}
        {(readme || projectReadme) && (
          <div className='mb-12'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='section-heading'>Documentation</h2>
              <div className='flex rounded-lg overflow-hidden border border-[var(--card-border)]'>
                <button
                  onClick={() => setViewMode('technical')}
                  className={`px-3 py-1.5 text-sm transition-colors ${
                    viewMode === 'technical'
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--background)]'
                  }`}
                  disabled={!readme}
                >
                  Technical
                </button>
                {/* Commented out Project tab to disable GitHubFolio.md switch */}
                {/* <button
                  onClick={() => setViewMode('project')}
                  className={`px-3 py-1.5 text-sm transition-colors ${
                    viewMode === 'project'
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--background)]'
                  }`}
                  disabled={!projectReadme}
                >
                  Project
                </button> */}
              </div>
            </div>
            <div className='card bg-[var(--card-bg)]'>
              <div className='flex items-center gap-2 px-4 py-2 border-b border-[var(--card-border)]'>
                <div className='w-3 h-3 rounded-full bg-red-500'></div>
                <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
                <div className='w-3 h-3 rounded-full bg-green-500'></div>
                <div className='ml-2 text-xs font-mono text-[var(--text-secondary)]'>
                  {viewMode === 'technical' ? 'README.md' : 'GitHubFolio.md'}
                </div>
              </div>
              <div className='p-6'>
                <div className='prose max-w-none dark:prose-headings:text-white dark:prose-strong:text-white prose-headings:text-[var(--text-primary)] prose-strong:text-[var(--text-primary)] prose-p:text-[var(--text-secondary)] prose-a:text-[var(--primary)] prose-code:text-[var(--text-primary)] prose-pre:bg-[var(--background)] prose-pre:text-[var(--text-primary)]'>
                  {(viewMode === 'technical' && readme) ||
                  (viewMode === 'project' && projectReadme) ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        img: ({ node, ...props }) => (
                          <img
                            {...props}
                            src={transformImageUri(props.src || '')}
                            className='max-w-full my-4 rounded-md'
                            alt={props.alt || ''}
                          />
                        ),
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='hover:underline'
                          />
                        ),
                        pre: ({ node, ...props }: any) => {
                          const [isCodeCopied, setIsCodeCopied] =
                            useState(false);
                          const preRef = React.useRef<HTMLPreElement>(null);

                          const copyToClipboard = () => {
                            if (preRef.current) {
                              const codeElement =
                                preRef.current.querySelector('code');
                              const textToCopy = codeElement?.textContent || '';
                              navigator.clipboard.writeText(textToCopy);
                              setIsCodeCopied(true);
                              setTimeout(() => setIsCodeCopied(false), 2000);
                            }
                          };

                          return (
                            <div className='relative group'>
                              <pre
                                {...props}
                                ref={preRef}
                                className='bg-[#1a1a1a] dark:bg-[#0d1117] p-4 rounded-md overflow-x-auto text-sm my-4'
                              />
                              <button
                                onClick={copyToClipboard}
                                className='absolute top-2 right-2 bg-[var(--card-border)] hover:bg-[var(--primary)] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity'
                                title='Copy code'
                                aria-label='Copy code to clipboard'
                              >
                                {isCodeCopied ? (
                                  <>
                                    <svg
                                      xmlns='http://www.w3.org/2000/svg'
                                      width='16'
                                      height='16'
                                      viewBox='0 0 24 24'
                                      fill='none'
                                      stroke='currentColor'
                                      strokeWidth='2'
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                    >
                                      <polyline points='20 6 9 17 4 12'></polyline>
                                    </svg>
                                    <span className='absolute -bottom-8 right-0 bg-[var(--card-bg)] text-white text-xs py-1 px-2 rounded'>
                                      Copied!
                                    </span>
                                  </>
                                ) : (
                                  <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='16'
                                    height='16'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                  >
                                    <rect
                                      x='9'
                                      y='9'
                                      width='13'
                                      height='13'
                                      rx='2'
                                      ry='2'
                                    ></rect>
                                    <path d='M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1'></path>
                                  </svg>
                                )}
                              </button>
                            </div>
                          );
                        },
                        code: ({ node, inline, ...props }: any) =>
                          inline ? (
                            <code
                              {...props}
                              className='bg-[var(--background)] px-1 py-0.5 rounded text-sm'
                            />
                          ) : (
                            <code {...props} />
                          ),
                        table: ({ node, ...props }) => (
                          <div className='overflow-x-auto my-4'>
                            <table
                              {...props}
                              className='border-collapse w-full'
                            />
                          </div>
                        ),
                        th: ({ node, ...props }) => (
                          <th
                            {...props}
                            className='border border-[var(--card-border)] px-4 py-2 text-left bg-[var(--background)]'
                          />
                        ),
                        td: ({ node, ...props }) => (
                          <td
                            {...props}
                            className='border border-[var(--card-border)] px-4 py-2'
                          />
                        ),
                      }}
                    >
                      {viewMode === 'technical' ? readme : projectReadme}
                    </ReactMarkdown>
                  ) : (
                    <div className='flex flex-col items-center justify-center py-8 text-[var(--text-secondary)]'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-16 w-16 mb-4'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={1.5}
                          d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                        />
                      </svg>
                      <p>
                        {viewMode === 'technical'
                          ? 'No README.md found for this repository.'
                          : 'No GitHubFolio.md found for this repository.'}
                      </p>
                      {/* Commented out additional message for project mode */}
                      {/* {viewMode === 'project' && (
                        <p className='text-xs mt-2'>
                          Create a GitHubFolio.md file in your repository to
                          show a project-focused view.
                        </p>
                      )} */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
