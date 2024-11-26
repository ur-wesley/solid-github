import { createEffect, createSignal, For, Show } from "solid-js";
import { useApi } from "../Api.tsx";
import { createQuery } from "@tanstack/solid-query";

export default function Sidebar() {
 const [$store, { fetchRepos, selectRepo }] = useApi();
 const [filteredRepos, setFilteredRepos] = createSignal($store.repositories);
 const [showOwner, setShowOwner] = createSignal(true);

 const repoQuery = createQuery(() => ({
  queryKey: ["repos"],
  queryFn: fetchRepos,
 }));

 createEffect(async () => {
  if (repoQuery.data) {
   setFilteredRepos($store.repositories);
  }
 });

 return (
  <aside class="overflow-auto bg-card flex flex-col gap-2">
   <div class="w-full bg-secondary/50 backdrop-blur z-20 sticky top-0 p-2 flex items-center flex flex-col gap-1">
    <div class="bg-background text-foreground flex gap-2 items-center w-full rounded-lg p-2">
     <i class="i-mdi-magnify p-3" />
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
     />
    </div>
    <div
     class="flex items-center gap-2 p-2"
     onclick={() => setShowOwner(!showOwner())}
    >
     <span>{showOwner() ? "hide owner" : "show owner"}</span>
     <i
      class="p-2"
      classList={{
       "i-mdi-eye": !showOwner(),
       "i-mdi-eye-off": showOwner(),
      }}
     />
    </div>
   </div>
   <Show when={repoQuery.data}>
    <ul class="list-none m-0 flex flex-col gap-1 p-2 z-10">
     <For each={filteredRepos()} fallback={<li>No repositories found</li>}>
      {(repo) => {
       const [owner, name] = repo.full_name.split("/");
       return (
        <Show when={repo.id}>
         <li
          class="flex flex-col px-2 py-1 rounded-lg cursor-pointer transition relative"
          classList={{
           "bg-secondary text-foreground":
            $store.selectedRepo?.id !== repo.id || !!!$store.selectedRepo,
           "bg-primary text-secondary":
            !!$store.selectedRepo && $store.selectedRepo!.id === repo.id,
          }}
          onclick={() => selectRepo(repo.id)}
         >
          <Show when={showOwner()}>
           <span>
            <b>{owner}</b>
            <Show when={repo.open_issues_count > 0}>
             <span> ({repo.open_issues_count}) </span>
            </Show>
           </span>
          </Show>
          <span>{name}</span>
          <Show when={repo.isFavorite}>
           <i class="i-mdi-star p-2 absolute top-1 right-1 bg-yellow" />
          </Show>
         </li>
        </Show>
       );
      }}
     </For>
    </ul>
   </Show>
  </aside>
 );
}
