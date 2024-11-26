import { useApi } from "@/Api.tsx";

export default function Details() {
 const [$store, { selectIssue }] = useApi();

 return (
  <div class="flex flex-col justify-between h-full">
   <div>
    <div class="w-full bg-secondary text-foreground flex gap-2 items-center justify-between p-2">
     <div class="flex gap-2 items-center">
      <i class="i-mdi-arrow-left p-4" onclick={() => selectIssue(-1)} />
      <h1>Issues</h1>
     </div>
     <div
      class="rounded-full px-2"
      classList={{
       "bg-green": $store.selectedIssue?.state === "open",
       "bg-red": $store.selectedIssue?.state === "closed",
      }}
     >
      <span>{$store.selectedIssue?.state}</span>
     </div>
    </div>
    <div class="p-2">
     <h2>
      #{$store.selectedIssue?.number} {$store.selectedIssue?.title}
     </h2>
     <p>{$store.selectedIssue?.body}</p>
    </div>
   </div>
   <div class="sticky bottom-0 p-2 bg-gray">
    <button>edit</button>
   </div>
  </div>
 );
}
