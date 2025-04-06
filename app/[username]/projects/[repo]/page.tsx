'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import BottomNavigation from '@/components/BottomNavigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { createGitHubHeaders } from '@/lib/githubToken';

// Updated interface that won't conflict
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
  // Additional fields for the detailed repo response
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
        // Use createGitHubHeaders to get headers with the appropriate token
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
            // README content is base64 encoded - use TextDecoder for proper UTF-8 decoding
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
          // Continue without README
        }

        // Try to fetch GitHubFolio.md for project view with multiple case variations and locations
        const tryFetchProjectReadme = async (path: any) => {
          try {
            const projectReadmeResponse = await fetch(
              `https://api.github.com/repos/${username}/${repoName}/contents/${path}`,
              { headers }
            );

            if (projectReadmeResponse.ok) {
              const projectReadmeData = await projectReadmeResponse.json();
              // Content is base64 encoded
              const content = projectReadmeData.content;
              const byteCharacters = atob(content.replace(/\s/g, ''));
              const byteNumbers = new Array(byteCharacters.length);

              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }

              const byteArray = new Uint8Array(byteNumbers);
              const decodedContent = new TextDecoder('utf-8').decode(byteArray);

              setProjectReadme(decodedContent);

              // If we have a project readme, default to project view
              setViewMode('project');
              return true;
            }
            return false;
          } catch (error) {
            console.error(`Error fetching ${path}:`, error);
            return false;
          }
        };

        // Try different variations of the project file name and location
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
          // Continue without contributors
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
          // Continue without languages
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

    // Handle relative image paths
    const repoBaseUrl = `https://raw.githubusercontent.com/${username}/${repoName}/${
      repoData?.default_branch || 'main'
    }`;

    // Remove leading slash if present
    const cleanSrc = src.startsWith('/') ? src.substring(1) : src;

    return `${repoBaseUrl}/${cleanSrc}`;
  };

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <div className='w-16 h-16 relative'>
          <div className='absolute inset-0 rounded-full border-2 border-[#8976EA] border-t-transparent animate-spin'></div>
        </div>
        <p className='mt-4 text-gray-400'>Loading project...</p>
      </div>
    );
  }

  if (error || !repoData) {
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
        <h2 className='text-2xl font-bold mb-2'>Project Not Found</h2>
        <p className='text-gray-400 mb-6'>
          {error || "Couldn't load this project"}
        </p>
        <Link
          href={`/${username}`}
          className='px-6 py-2 bg-[#8976EA] rounded-full text-white'
        >
          Back to Profile
        </Link>
      </div>
    );
  }

  return (
    <div className='flex flex-col pb-32'>
      {/* Back button and repo link */}
      <div className='flex justify-between items-center mb-8'>
        <Link
          href={`/${username}`}
          className='text-gray-400 hover:text-white transition-colors flex items-center gap-2'
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
          Back to profile
        </Link>

        <a
          href={repoData.html_url}
          target='_blank'
          rel='noopener noreferrer'
          className='text-[#8976EA] hover:underline flex items-center gap-1'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-4 w-4'
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z'
              clipRule='evenodd'
            />
          </svg>
          View on GitHub
        </a>
      </div>

      {/* Project header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>{repoData.name}</h1>
        {repoData.description && (
          <p className='text-gray-300 text-lg mb-4'>{repoData.description}</p>
        )}

        <div className='flex flex-wrap gap-4 mb-4'>
          <div className='flex items-center gap-1.5'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 text-yellow-400'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
            </svg>
            <span>{repoData.stargazers_count} stars</span>
          </div>

          <div className='flex items-center gap-1.5'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 text-gray-400'
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

          <div className='flex items-center gap-1.5'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 text-gray-400'
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

          <div className='flex items-center gap-1.5'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 text-gray-400'
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

        {/* Topics */}
        {repoData.topics && repoData.topics.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {repoData.topics.map((topic) => (
              <span
                key={topic}
                className='px-3 py-1 bg-[#111111] rounded-full text-sm'
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Languages */}
      {Object.keys(languages).length > 0 && (
        <div className='mb-12'>
          <h2 className='text-xl font-bold mb-4'>Languages</h2>

          <div className='h-4 bg-[#111111] rounded-full overflow-hidden mb-4'>
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
            {calculateLanguagePercentages().map(({ language, percentage }) => (
              <div key={language} className='flex items-center gap-2'>
                <span
                  className='h-3 w-3 rounded-full'
                  style={{ backgroundColor: getLanguageColor(language) }}
                ></span>
                <span>
                  {language}{' '}
                  <span className='text-gray-400 text-sm'>{percentage}%</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contributors */}
      {contributors.length > 0 && (
        <div className='mb-12'>
          <h2 className='text-xl font-bold mb-4'>Contributors</h2>

          <div className='flex flex-wrap gap-4'>
            {contributors.map((contributor) => (
              <a
                key={contributor.login}
                href={contributor.html_url}
                target='_blank'
                rel='noopener noreferrer'
                className='flex flex-col items-center'
              >
                <div className='w-16 h-16 relative rounded-full overflow-hidden border border-[#222222] mb-2'>
                  <Image
                    src={contributor.avatar_url}
                    alt={contributor.login}
                    fill
                    className='object-cover'
                  />
                </div>
                <span className='text-sm font-mono'>{contributor.login}</span>
                <span className='text-xs text-gray-400'>
                  {contributor.contributions} commits
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* README with proper Markdown rendering */}
      {(readme || projectReadme) && (
        <div className='mb-12'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-bold'>Documentation</h2>

            <div className='flex rounded-lg overflow-hidden border border-[#222222]'>
              <button
                onClick={() => setViewMode('technical')}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  viewMode === 'technical'
                    ? 'bg-[#8976EA] text-white'
                    : 'bg-[#111111] text-gray-300 hover:bg-[#191919]'
                }`}
                disabled={!readme}
              >
                Technical
              </button>
              <button
                onClick={() => setViewMode('project')}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  viewMode === 'project'
                    ? 'bg-[#8976EA] text-white'
                    : 'bg-[#111111] text-gray-300 hover:bg-[#191919]'
                }`}
                disabled={!projectReadme}
              >
                Project
              </button>
            </div>
          </div>

          {/* Debug message if no documentation is available for selected view */}
          {((viewMode === 'technical' && !readme) ||
            (viewMode === 'project' && !projectReadme)) && (
            <div className='bg-[#111111] border border-[#222222] rounded-lg p-6 mb-4'>
              <p className='text-gray-400 text-center'>
                {viewMode === 'technical'
                  ? 'No README.md found for this repository.'
                  : 'No GitHubFolio.md or PROJECT.md found for this repository.'}
              </p>
              <p className='text-xs text-gray-500 text-center mt-2'>
                {viewMode === 'project' &&
                  'Create a GitHubFolio.md file in your repository to show a project-focused view.'}
              </p>
            </div>
          )}

          <div className='bg-[#111111] border border-[#222222] rounded-lg p-6 prose prose-invert prose-a:text-[#8976EA] prose-headings:border-b prose-headings:border-[#222222] prose-headings:pb-2 max-w-none'>
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
                    // We need to extract the actual code as a string
                    const [copied, setCopied] = useState(false);

                    // Get reference to the pre element
                    const preRef = React.useRef<HTMLPreElement>(null);

                    const copyToClipboard = () => {
                      if (preRef.current) {
                        // Get the text content from the pre element
                        const codeElement =
                          preRef.current.querySelector('code');
                        const textToCopy = codeElement?.textContent || '';

                        // Copy to clipboard
                        navigator.clipboard.writeText(textToCopy);

                        // Show copied confirmation
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }
                    };

                    return (
                      <div className='relative group'>
                        <pre
                          {...props}
                          ref={preRef}
                          className='bg-[#191919] p-4 rounded-md overflow-x-auto text-sm my-4'
                        />
                        <button
                          onClick={copyToClipboard}
                          className='absolute top-2 right-2 bg-[#333333] hover:bg-[#444444] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity'
                          title='Copy code'
                          aria-label='Copy code to clipboard'
                        >
                          {copied ? (
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
                              <span className='absolute top-10 right-0 bg-[#333333] text-white text-xs py-1 px-2 rounded'>
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
                        className='bg-[#191919] px-1 py-0.5 rounded text-sm'
                      />
                    ) : (
                      <code {...props} />
                    ),
                  table: ({ node, ...props }) => (
                    <div className='overflow-x-auto my-4'>
                      <table {...props} className='border-collapse w-full' />
                    </div>
                  ),
                  th: ({ node, ...props }) => (
                    <th
                      {...props}
                      className='border border-[#333333] px-4 py-2 text-left'
                    />
                  ),
                  td: ({ node, ...props }) => (
                    <td
                      {...props}
                      className='border border-[#333333] px-4 py-2'
                    />
                  ),
                }}
              >
                {viewMode === 'technical' ? readme : projectReadme}
              </ReactMarkdown>
            ) : (
              <div className='flex flex-col items-center justify-center py-8'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-16 w-16 text-gray-700 mb-4'
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
                <p className='text-gray-500'>
                  No documentation content available
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation username={username} />
    </div>
  );
}
