import { createContext, useContext, JSX, createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { $Fetch, ofetch } from "ofetch";
import { writeConfig } from "./tauriHelper.ts";

type Issue = {
 id: number;
 title: string;
 body: string;
 state: string;
};

type Repo = {
 id: number;
 name: string;
 full_name: string;
};

type ApiStore = {
 issues: Issue[];
 token: string | null;
 repositories: Repo[];
 selectedRepo: { owner: string; repo: string } | null;
 owner: Owner | null;
};

type Owner = {
 login: string;
 avatar_url: string;
};

type ApiActions = {
 setToken: (token: string) => void;
 fetchOwner: () => Promise<Owner | null>;
 fetchRepos: () => Promise<Repo[]>;
 selectRepo: (owner: string, repo: string) => void;
 fetchIssues: () => Promise<void>;
 createIssue: (issue: Partial<Issue>) => Promise<Issue>;
 updateIssue: (issueNumber: number, data: Partial<Issue>) => Promise<Issue>;
 deleteIssue: (issueNumber: number) => Promise<void>;
};

const ApiContext = createContext<readonly [ApiStore, ApiActions] | null>(null);

export const ApiProvider = (props: { children: JSX.Element }) => {
 const [store, setStore] = createStore<ApiStore>({
  issues: [],
  token: null,
  repositories: [],
  selectedRepo: null,
  owner: null,
 });

 let api: $Fetch = ofetch.create({});

 createEffect(() => {
  api = ofetch.create({
   headers: {
    Authorization: store.token ? `Bearer ${store.token}` : "",
    "X-GitHub-Api-Version": "2022-11-28",
   },
  });
 });

 const actions: ApiActions = {
  setToken: (token) => {
   setStore("token", token);
   writeConfig({ token });
  },

  fetchOwner: async () => {
   if (!store.token) throw new Error("GitHub token is not set.");
   try {
    const response = await api<Owner>("https://api.github.com/user");
    setStore("owner", response);
    return response;
   } catch (error) {
    console.error("Error fetching owner information:", error);
    return null;
   }
  },

  fetchRepos: async () => {
   if (!store.token) throw new Error("GitHub token is not set.");
   try {
    const response = await api<Repo[]>("https://api.github.com/user/repos");
    setStore("repositories", response);
    return response;
   } catch (error) {
    console.error("Error fetching repositories:", error);
    return [];
   }
  },

  selectRepo: (owner, repo) => {
   setStore("selectedRepo", { owner, repo });
  },

  fetchIssues: async () => {
   if (!store.token) throw new Error("GitHub token is not set.");
   if (!store.selectedRepo)
    throw new Error("No repository selected. Please select a repository.");
   const { owner, repo } = store.selectedRepo;
   try {
    const response = await api<Issue[]>(
     `https://api.github.com/repos/${owner}/${repo}/issues`
    );
    setStore("issues", response);
   } catch (error) {
    console.error("Error fetching issues:", error);
    throw error;
   }
  },

  createIssue: async (issue) => {
   if (!store.token) throw new Error("GitHub token is not set.");
   if (!store.selectedRepo)
    throw new Error("No repository selected. Please select a repository.");
   const { owner, repo } = store.selectedRepo;
   try {
    const response = await api<Issue>(
     `https://api.github.com/repos/${owner}/${repo}/issues`,
     {
      method: "POST",
      body: issue,
     }
    );
    setStore("issues", [...store.issues, response]);
    return response;
   } catch (error) {
    console.error("Error creating issue:", error);
    throw error;
   }
  },

  updateIssue: async (issueNumber, data) => {
   if (!store.token) throw new Error("GitHub token is not set.");
   if (!store.selectedRepo)
    throw new Error("No repository selected. Please select a repository.");
   const { owner, repo } = store.selectedRepo;
   try {
    const response = await api<Issue>(
     `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
     {
      method: "PATCH",
      body: data,
     }
    );
    setStore(
     "issues",
     store.issues.map((issue) => (issue.id === issueNumber ? response : issue))
    );
    return response;
   } catch (error) {
    console.error("Error updating issue:", error);
    throw error;
   }
  },

  deleteIssue: async (issueNumber) => {
   if (!store.token) throw new Error("GitHub token is not set.");
   if (!store.selectedRepo)
    throw new Error("No repository selected. Please select a repository.");
   const { owner, repo } = store.selectedRepo;
   try {
    await api(
     `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
     {
      method: "DELETE",
     }
    );
    setStore(
     "issues",
     store.issues.filter((issue) => issue.id !== issueNumber)
    );
   } catch (error) {
    console.error("Error deleting issue:", error);
    throw error;
   }
  },
 };

 return (
  <ApiContext.Provider value={[store, actions] as const}>
   {props.children}
  </ApiContext.Provider>
 );
};

export const useApi = () => useContext(ApiContext)!;
