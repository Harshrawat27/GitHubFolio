export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  hireable?: boolean;
}

export interface Repository {
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
}

export interface LanguageStat {
  language: string;
  count: number;
  color?: string;
}

export interface CommitActivity {
  week: number;
  total: number;
  days: number[];
}

export interface Contributor {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

// Duplicate all properties from Repository but make license optional
export interface RepoDetails {
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
  // Make license optional
  license?: {
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
  // Additional properties for RepoDetails
  subscribers_count?: number;
  network_count?: number;
  has_issues?: boolean;
  has_projects?: boolean;
  has_downloads?: boolean;
  has_wiki?: boolean;
  has_pages?: boolean;
  archived?: boolean;
  disabled?: boolean;
  languages_url?: string;
  languages?: Record<string, number>;
}

export interface ReadmeInfo {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content: string;
  encoding: string;
}

export interface LanguagePercentage {
  language: string;
  percentage: number;
  bytes: number;
  color?: string;
}
