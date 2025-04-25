// components/AboutMeWithReadme.tsx
'use client';

import { useState, useEffect } from 'react';
import { GitHubUser } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw'; // Import rehype-raw to handle HTML in markdown
import { createGitHubHeaders } from '@/lib/githubToken';

interface AboutMeWithReadmeProps {
  username: string;
  user: GitHubUser;
  token: string | null;
}

export default function AboutMeWithReadme({
  username,
  user,
  token,
}: AboutMeWithReadmeProps) {
  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Calculate years on GitHub (for fallback bio)
  const joinDate = new Date(user.created_at);
  const currentDate = new Date();
  const yearsOnGitHub = Math.floor(
    (currentDate.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
  );

  // Create a fallback bio if none exists
  const defaultBio = `
    Hey, I'm ${user.name || user.login} from ${
    user.location || 'around the world'
  }! 
    I've been coding on GitHub for ${yearsOnGitHub} ${
    yearsOnGitHub === 1 ? 'year' : 'years'
  }.
    I have ${user.public_repos} repositories and ${user.followers} followers.
  `;

  // Try to fetch README from special GitHub repo: username/username
  useEffect(() => {
    const fetchReadme = async () => {
      setLoading(true);

      try {
        const headers = createGitHubHeaders();

        // Try to fetch the special username/username repository's README.md
        // This is used by GitHub as the profile README
        const readmeResponse = await fetch(
          `https://api.github.com/repos/${username}/${username}/readme`,
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

          setReadmeContent(decodedContent);
        } else {
          // No special README repository found
          setReadmeContent(null);
        }
      } catch (error) {
        console.error('Error fetching profile README:', error);
        setReadmeContent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReadme();
  }, [username, token]);

  // Custom renderer for images to handle GitHub relative URLs
  const transformImageUri = (src: string) => {
    if (src.startsWith('http')) {
      return src;
    }

    // Handle relative image paths for the special README repo
    const repoBaseUrl = `https://raw.githubusercontent.com/${username}/${username}/main`;

    // Remove leading slash if present
    const cleanSrc = src.startsWith('/') ? src.substring(1) : src;

    return `${repoBaseUrl}/${cleanSrc}`;
  };

  // Handle HTML content safely
  const handleHTMLInMarkdown = (html: string) => {
    // You could add additional safety/sanitization here if needed
    return html;
  };

  // If we have a GitHub profile README, render it
  if (readmeContent) {
    return (
      <div className='card bg-[var(--card-bg)] border border-[var(--card-border)] overflow-hidden'>
        <div className='flex items-center gap-2 px-4 py-2 border-b border-[var(--card-border)] bg-opacity-50'>
          <div className='w-3 h-3 rounded-full bg-red-500'></div>
          <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
          <div className='w-3 h-3 rounded-full bg-green-500'></div>
          <div className='ml-2 text-xs font-mono text-[var(--text-secondary)]'>
            README.md
          </div>
        </div>
        <div className='p-6'>
          <div className='prose max-w-none dark:prose-headings:text-white dark:prose-strong:text-white prose-headings:text-[var(--text-primary)] prose-strong:text-[var(--text-primary)] prose-p:text-[var(--text-secondary)] prose-a:text-[var(--primary)] prose-code:text-[var(--text-primary)] prose-pre:bg-[var(--background)] prose-pre:text-[var(--text-primary)]'>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]} // Add rehypeRaw plugin to process HTML
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
                    className='text-[var(--primary)] hover:underline'
                  />
                ),
                code: ({ node, inline, ...props }: any) =>
                  inline ? (
                    <code
                      {...props}
                      className='bg-[var(--background)] px-1 py-0.5 rounded text-sm'
                    />
                  ) : (
                    <code {...props} />
                  ),
                // Handle HTML
                div: ({ node, ...props }) => <div {...props} />,
                span: ({ node, ...props }) => <span {...props} />,
                table: ({ node, ...props }) => (
                  <table
                    className='border-collapse table-auto w-full'
                    {...props}
                  />
                ),
                thead: ({ node, ...props }) => <thead {...props} />,
                tbody: ({ node, ...props }) => <tbody {...props} />,
                tr: ({ node, ...props }) => <tr {...props} />,
                td: ({ node, ...props }) => (
                  <td
                    className='border border-[var(--card-border)] px-2 py-1'
                    {...props}
                  />
                ),
                th: ({ node, ...props }) => (
                  <th
                    className='border border-[var(--card-border)] px-2 py-1 font-bold'
                    {...props}
                  />
                ),
              }}
            >
              {readmeContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  // Fallback to terminal-style about me if no README exists
  return (
    <div className='card bg-[var(--card-bg)] border border-[var(--card-border)] overflow-hidden'>
      <div className='flex items-center gap-2 px-4 py-2 border-b border-[var(--card-border)] bg-opacity-50'>
        <div className='w-3 h-3 rounded-full bg-red-500'></div>
        <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
        <div className='w-3 h-3 rounded-full bg-green-500'></div>
        <div className='ml-2 text-xs font-mono text-[var(--text-secondary)]'>
          about.md
        </div>
      </div>
      <div className='p-6 font-mono'>
        <div className='space-y-4 text-[var(--text-primary)]'>
          <div className='flex items-center gap-2 mb-2'>
            <span className='font-mono text-[var(--primary)]'>$</span>
            <span className='text-[var(--text-secondary)]'>whoami</span>
          </div>

          <div className='pl-4'>
            <p className='leading-relaxed whitespace-pre-line'>
              {user.bio || defaultBio}
            </p>
          </div>

          <div className='flex items-center gap-2 mb-2'>
            <span className='font-mono text-[var(--primary)]'>$</span>
            <span className='text-[var(--text-secondary)]'>
              git log --author="{user.login}" --since="first commit"
            </span>
          </div>

          <div className='pl-4 space-y-2'>
            <div className='flex flex-wrap gap-x-6 gap-y-2'>
              <div className='flex items-center gap-2'>
                <span className='text-[var(--primary)] font-mono'>
                  first-commit
                </span>
                <span>
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              <div className='flex items-center gap-2'>
                <span className='text-[var(--primary)] font-mono'>
                  total-repos
                </span>
                <span>{user.public_repos}</span>
              </div>

              <div className='flex items-center gap-2'>
                <span className='text-[var(--primary)] font-mono'>
                  followers
                </span>
                <span>{user.followers}</span>
              </div>

              <div className='flex items-center gap-2'>
                <span className='text-[var(--primary)] font-mono'>
                  following
                </span>
                <span>{user.following}</span>
              </div>

              <div className='flex items-center gap-2'>
                <span className='text-[var(--primary)] font-mono'>
                  experience
                </span>
                <span>
                  {yearsOnGitHub} {yearsOnGitHub === 1 ? 'year' : 'years'}
                </span>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2 mb-2'>
            <span className='font-mono text-[var(--primary)]'>$</span>
            <span className='text-[var(--text-secondary)]'>cat contact.md</span>
          </div>

          <div className='pl-4 space-y-2'>
            {user.email && (
              <div className='flex items-center gap-2'>
                <span className='text-[var(--primary)] font-mono'>email</span>
                <a href={`mailto:${user.email}`} className='hover:underline'>
                  {user.email}
                </a>
              </div>
            )}

            {user.blog && (
              <div className='flex items-center gap-2'>
                <span className='text-[var(--primary)] font-mono'>website</span>
                <a
                  href={
                    user.blog.startsWith('http')
                      ? user.blog
                      : `https://${user.blog}`
                  }
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:underline'
                >
                  {user.blog}
                </a>
              </div>
            )}

            {user.twitter_username && (
              <div className='flex items-center gap-2'>
                <span className='text-[var(--primary)] font-mono'>twitter</span>
                <a
                  href={`https://twitter.com/${user.twitter_username}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:underline'
                >
                  @{user.twitter_username}
                </a>
              </div>
            )}

            {user.location && (
              <div className='flex items-center gap-2'>
                <span className='text-[var(--primary)] font-mono'>
                  location
                </span>
                <span>{user.location}</span>
              </div>
            )}

            {user.company && (
              <div className='flex items-center gap-2'>
                <span className='text-[var(--primary)] font-mono'>company</span>
                <span>{user.company}</span>
              </div>
            )}
          </div>

          <div className='mt-8 pt-4 border-t border-[var(--card-border)]'>
            <div className='flex items-center gap-2 mb-2'>
              <span className='font-mono text-[var(--primary)]'>$</span>
              <span className='text-[var(--text-secondary)]'>
                cat create-readme.txt
              </span>
            </div>

            <div className='pl-4'>
              <p className='text-sm'>
                Did you know GitHub has a special feature for profile READMEs?
                Create a repository with the same name as your username "
                {username}" and add a README.md file to it. It will be displayed
                on your GitHub profile!
              </p>

              <a
                href={`https://github.com/new?filename=README.md&name=${username}`}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-dark)] transition-colors'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 mr-2'
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
                Create Profile README
              </a>
            </div>
          </div>

          <div className='flex items-center gap-2 mb-2'>
            <span className='font-mono text-[var(--primary)]'>$</span>
            <span className='text-[var(--text-secondary)] animate-pulse'>
              █
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
