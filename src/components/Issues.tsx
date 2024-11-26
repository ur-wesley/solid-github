import { useApi } from "@/Api.tsx";
import { createQuery } from "@tanstack/solid-query";
import { createEffect, createSignal, For, Show } from "solid-js";

export default function Issues() {
 const [$store, { fetchIssues, createIssue, selectIssue }] = useApi();
 const [showTextfield, setShowTextfield] = createSignal(false);

 const issueQuery = createQuery(() => ({
  queryKey: ["issues", $store.selectedRepo?.id],
  queryFn: fetchIssues,
 }));

 createEffect(() => {
  console.log("issueQuery", $store.selectedRepo?.id);
 });

 return (
  <>
   <div class="w-full flex gap-2 items-center">
    <Show
     when={showTextfield()}
     fallback={
      <button onclick={() => setShowTextfield(true)}>create issue</button>
     }
    >
     <input
      type="text"
      placeholder="Issue title"
      onblur={(e) => {
       setShowTextfield(false);
       e.currentTarget.value = "";
      }}
      onkeypress={(e) => {
       if (e.key === "Enter") {
        createIssue({ title: e.currentTarget.value });
        setShowTextfield(false);
       }
       if (e.key === "Escape") {
        setShowTextfield(false);
        e.currentTarget.value = "";
       }
      }}
     />
    </Show>
   </div>
   <Show when={$store.selectedRepo && issueQuery.isSuccess}>
    <ul class="p-2 h-full flex flex-col gap-2">
     <For
      each={$store.issues}
      fallback={
       <span class="grid place-content-center h-full">No issues found</span>
      }
     >
      {(issue) => (
       <li
        onclick={() => selectIssue(issue.id)}
        class="flex p-2 bg-secondary/80 hover:bg-secondary rounded-lg gap-2 cursor-pointer whitespace-wrap"
       >
        <span>#{issue.number}</span>
        <span>{issue.title}</span>
       </li>
      )}
     </For>
    </ul>
   </Show>
  </>
 );
}
