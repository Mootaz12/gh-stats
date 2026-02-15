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
