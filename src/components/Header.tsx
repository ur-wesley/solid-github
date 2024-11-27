import { Show } from "solid-js";
import { useApi } from "../Api.tsx";
import { createQuery } from "@tanstack/solid-query";
import { Avatar } from "@ark-ui/solid/avatar";
import { Logout } from "../Auth.ts";

export default function Header(props: {
 onExpand: (value: boolean) => void;
 expanded: boolean;
}) {
 const [$store, { fetchOwner, favoriteRepo }] = useApi();

 const ownerQuery = createQuery(() => ({
  queryKey: ["owner"],
  queryFn: fetchOwner,
 }));

 function toggleTheme() {
  const theme = document.documentElement.getAttribute("data-kb-theme");
  document.documentElement.setAttribute(
   "data-kb-theme",
   theme === "dark" ? "light" : "dark"
  );
 }

 return (
  <header
   class="flex sticky top-0 gap-2 p-2 w-full items-center justify-between bg-card"
   style={{ "grid-area": "header" }}
  >
   <div class="" onclick={() => props.onExpand(!props.expanded)}>
    <i class="i-mdi-menu p-2" aria-hidden="true" />
    <span>solid-github</span>
   </div>
   <Show when={$store.selectedRepo?.id}>
    <div class="flex gap-2 items-center">
     <a
      target="_blank"
      class="text-foreground flex gap-2 items-center"
      href={$store.selectedRepo?.html_url}
     >
      <i
       classList={{
        "i-mdi-lock": $store.selectedRepo?.private,
        "i-mdi-lock-open-variant": !$store.selectedRepo?.private,
       }}
      />
      <span>{$store.selectedRepo?.full_name}</span>
      <i class="i-mdi-open-in-new p-2" />
     </a>
     <i
      class="i-mdi-star p-3 cursor-pointer"
      classList={{
       "bg-yellow": $store.selectedRepo?.isFavorite,
       "bg-primary": !$store.selectedRepo?.isFavorite,
      }}
      onclick={() => favoriteRepo($store.selectedRepo!.id)}
     />
    </div>
   </Show>
   <Show when={ownerQuery.isSuccess}>
    <div class="flex gap-2 items-center">
     <i class="i-mdi-weather-night p-2" onclick={toggleTheme} />
     <Avatar.Root>
      <Avatar.Fallback>{$store.owner?.login.slice(0, 2)}</Avatar.Fallback>
      <Avatar.Image
       src={$store.owner?.avatar_url}
       alt="avatar"
       class="w-8 rounded-full"
       onclick={Logout}
      />
     </Avatar.Root>
     <span>{$store.owner?.login}</span>
    </div>
   </Show>
  </header>
 );
}
