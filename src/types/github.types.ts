export type UserProfile = {
  login: string;
  name: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  profileUrl: string;
};

export type Repository = {
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  isPrivate: boolean;
};

export type PullRequest = {
  number: number;
  title: string;
  author: string;
  createdAt: string;
  state: string;
  url: string;
};

export type Commit = {
  sha: string;
  message: string;
  author: string;
  date: string;
};

// Parameter types for GitHubService methods
export type GetRepositoryPullRequestsParams = {
  owner: string;
  repo: string;
  fromDate?: string;
  toDate?: string;
};

export type GetPullRequestCommitsParams = {
  owner: string;
  repo: string;
  pullNumber: number;
};

export type GetRepositoryCommitsParams = {
  owner: string;
  repo: string;
  author?: string;
  fromDate?: string;
  toDate?: string;
};
