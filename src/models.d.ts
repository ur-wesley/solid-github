declare type Issue = {
  id: number;
  title: string;
  body: string;
  state: string;
  number: number;
};

declare type Repo = {
  id: number;
  name: string;
  full_name: string;
  open_issues_count: number;
  private: boolean;
  html_url: string;
  isFavorite: boolean;
};

declare type ApiStore = {
  issues: Issue[];
  selectedIssue: Issue | null;
  repositories: Repo[];
  selectedRepo: Repo | null;
  owner: Owner | null;
  token: string | null;
};

declare type Owner = {
  login: string;
  avatar_url: string;
};