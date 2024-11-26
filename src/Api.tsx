import { createContext, useContext, JSX, createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { $Fetch, FetchError, ofetch } from "ofetch";
import AppStore from "./Store.ts";

type ApiActions = {
 fetchOwner: () => Promise<Owner | null>;
 fetchRepos: () => Promise<Repo[]>;
 selectRepo: (repoId: number) => void;
 fetchIssues: () => Promise<Issue[]>;
 selectIssue: (issueId: number) => void;
 createIssue: (issue: Partial<Issue>) => Promise<Issue>;
 updateIssue: (issueNumber: number, data: Partial<Issue>) => Promise<Issue>;
 deleteIssue: (issueNumber: number) => Promise<void>;
 favoriteRepo: (repoId: number) => Promise<void>;
};

const ApiContext = createContext<readonly [ApiStore, ApiActions] | null>(null);

const ApiProvider = (props: { children: JSX.Element; token: string }) => {
 let api: $Fetch;
 const appStore = AppStore.getInstance();

 const [store, setStore] = createStore<ApiStore>({
  issues: [],
  selectedIssue: null,
  repositories: [],
  selectedRepo: null,
  owner: null,
  token: props.token,
 });

 async function handleUnauthorized(error: FetchError) {
  if (error.status === 401) {
   await appStore.set("token", null);
  }
  return null;
 }

 createEffect(async () => {
  if (!store.token) return;
  console.log("Creating API instance with token:", store.token);
  api = ofetch.create({
   headers: {
    Authorization: `Bearer ${store.token}`,
    "X-GitHub-Api-Version": "2022-11-28",
   },
  });
 });

 const actions: ApiActions = {
  fetchOwner: async () => {
   if (!store.token || !api) throw new Error("GitHub token is not set.");
   try {
    return await api<Owner>("https://api.github.com/user")
     .then((response) => {
      setStore("owner", response);
      return response;
     })
     .catch(handleUnauthorized);
   } catch (error) {
    console.error("Error fetching owner information:", error);
    return null;
   }
  },

  fetchRepos: async () => {
   if (!store.token || !api) throw new Error("GitHub token is not set.");
   try {
    const response = await api<Repo[]>("https://api.github.com/user/repos", {
     query: {
      sort: "updated",
      per_page: "100",
     },
    });

    const appStore = AppStore.getInstance();
    const favorites = await appStore.get<number[]>("favorites");
    for (const repo of response) {
     repo.isFavorite = favorites?.includes(repo.id) ?? false;
    }
    response.sort((a, b) => {
     if (a.isFavorite && !b.isFavorite) return -1;
     if (!a.isFavorite && b.isFavorite) return 1;
     return 0;
    });

    setStore("repositories", response);
    return response;
   } catch (error) {
    console.error("Error fetching repositories:", error);
    return [];
   }
  },

  selectRepo: (id: number) => {
   setStore(
    "selectedRepo",
    store.repositories.find((r) => r.id === id) ?? null
   );
   console.log("Selected repo:", store.selectedRepo);
  },

  fetchIssues: async () => {
   if (!store.token || !api) throw new Error("GitHub token is not set.");
   if (!store.selectedRepo)
    throw new Error("No repository selected. Please select a repository.");
   const [owner, repo] = store.selectedRepo.full_name.split("/");
   try {
    const response = await api<Issue[]>(
     `https://api.github.com/repos/${owner}/${repo}/issues`
    );
    setStore("issues", response);
    return response;
   } catch (error) {
    console.error("Error fetching issues:", error);
    return [];
   }
  },

  selectIssue: (issueId) => {
   setStore(
    "selectedIssue",
    store.issues.find((issue) => issue.id === issueId) ?? null
   );
  },

  createIssue: async (issue) => {
   if (!store.token || !api) throw new Error("GitHub token is not set.");
   if (!store.selectedRepo)
    throw new Error("No repository selected. Please select a repository.");
   const [owner, repo] = store.selectedRepo.full_name.split("/");
   try {
    const response = await api<Issue>(
     `https://api.github.com/repos/${owner}/${repo}/issues`,
     {
      method: "POST",
      body: issue,
     }
    );
    setStore("issues", [response, ...store.issues]);
    return response;
   } catch (error) {
    console.error("Error creating issue:", error);
    throw error;
   }
  },

  updateIssue: async (issueNumber, data) => {
   if (!store.token || !api) throw new Error("GitHub token is not set.");
   if (!store.selectedRepo)
    throw new Error("No repository selected. Please select a repository.");
   const [owner, repo] = store.selectedRepo.full_name.split("/");
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
   if (!store.token || !api) throw new Error("GitHub token is not set.");
   if (!store.selectedRepo)
    throw new Error("No repository selected. Please select a repository.");
   const [owner, repo] = store.selectedRepo.full_name.split("/");
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

  favoriteRepo: async (repoId) => {
   const store = AppStore.getInstance();
   const favorites = await store.get<number[]>("favorites");
   if (favorites?.includes(repoId)) {
    await store.set(
     "favorites",
     favorites.filter((id) => id !== repoId)
    );
   } else {
    await store.set("favorites", [...(favorites ?? []), repoId]);
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
export default ApiProvider;
