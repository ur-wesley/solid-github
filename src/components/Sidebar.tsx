import { createEffect, createSignal, For, Show } from "solid-js";
import { useApi } from "../Api.tsx";
import { createQuery } from "@tanstack/solid-query";

export default function Sidebar(props: { expanded: boolean }) {
 const [$store, { fetchRepos, selectRepo }] = useApi();
 const [filteredRepos, setFilteredRepos] = createSignal<Repo[]>([]);
 const [showOwner, setShowOwner] = createSignal(true);

 const repoQuery = createQuery(() => ({
  queryKey: ["repos"],
  queryFn: fetchRepos,
  initialData: filteredRepos(),
 }));

 createEffect(() => {
  if (repoQuery.data) {
   setFilteredRepos(repoQuery.data);
  }
 });

 return (
  <aside
   class="overflow-auto bg-card flex flex-col gap-2"
   classList={{
    "-translate-x-full absolute top-0 left-0": !props.expanded,
   }}
   style={{ "grid-area": "sidebar" }}
   aria-labelledby="sidebar-title"
   role="complementary"
  >
   <div
    class="w-full bg-secondary/50 backdrop-blur z-20 sticky top-0 p-2 flex items-center flex flex-col gap-1"
    role="search"
    aria-label="Search and filter repositories"
   >
    <div
     class="bg-background text-text flex gap-2 items-center w-full rounded-lg p-2"
     role="searchbox"
     aria-label="Search repositories"
    >
     <i class="i-mdi-magnify p-3" aria-hidden="true" />
     <input
      type="text"
      placeholder="Search repositories"
      class="w-full rounded-lg bg-background border-none outline-none"
      oninput={(e) => {
       const query = e.currentTarget.value;
       setFilteredRepos(
        $store.repositories.filter((repo) =>
         repo.full_name.toLowerCase().includes(query.toLowerCase())
        )
       );
      }}
      aria-controls="repo-list"
      aria-label="Filter repositories by name"
     />
    </div>
    <div
     class="flex items-center gap-2 p-2"
     onclick={() => setShowOwner(!showOwner())}
     role="button"
     tabindex="0"
     aria-pressed={showOwner() ? "true" : "false"}
     aria-label={
      showOwner() ? "Hide owner information" : "Show owner information"
     }
    >
     <span>{showOwner() ? "hide owner" : "show owner"}</span>
     <i
      class="p-2"
      classList={{
       "i-mdi-eye": !showOwner(),
       "i-mdi-eye-off": showOwner(),
      }}
      aria-hidden="true"
     />
    </div>
   </div>
   <Show when={repoQuery.data}>
    <ul
     class="list-none m-0 flex flex-col gap-1 p-2 z-10"
     id="repo-list"
     role="list"
     aria-label="Repository list"
    >
     <For
      each={filteredRepos()}
      fallback={<li role="listitem">No repositories found</li>}
     >
      {(repo, index) => {
       const [owner, name] = repo.full_name.split("/");
       const { id, open_issues_count, isFavorite } = repo;
       return (
        <li
         class="flex flex-col px-2 py-1 rounded-lg cursor-pointer transition relative"
         classList={{
          "bg-secondary text-text":
           !$store.selectedRepo?.id || $store.selectedRepo?.id !== id,
          "bg-primary text-secondary":
           !!$store.selectedRepo?.id && $store.selectedRepo.id === id,
         }}
         role="listitem"
         aria-selected={
          !!$store.selectedRepo && $store.selectedRepo!.id === id
           ? "true"
           : "false"
         }
         tabindex="0"
         onclick={() => selectRepo(index())}
         //  onclick={() => selectRepo(id)}
         onkeypress={(e) => e.key === "Enter" && selectRepo(id)}
        >
         <Show when={showOwner()}>
          <span>
           <b>{owner}</b>
           <Show when={open_issues_count > 0}>
            <span> ({open_issues_count}) </span>
           </Show>
          </span>
         </Show>
         {repo.id}
         <span>{name}</span>
         <Show when={isFavorite}>
          <i
           class="i-mdi-star p-2 absolute top-1 right-1 bg-yellow"
           aria-label="Favorite repository"
          />
         </Show>
        </li>
       );
      }}
     </For>
    </ul>
   </Show>
  </aside>
 );
}
