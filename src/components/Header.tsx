import { Match, Switch } from "solid-js";
import { useApi } from "../Api.tsx";
import { createQuery } from "@tanstack/solid-query";
import { Avatar } from "@ark-ui/solid/avatar";

export default function Header() {
 const [$store, { fetchOwner }] = useApi();

 const ownerQuery = createQuery(() => ({
  queryKey: ["owner"],
  queryFn: fetchOwner,
 }));

 return (
  <header class="flex sticky top-0 gap-2 p-2 w-full items-center justify-between bg-gray/60 backdrop-blur">
   <span>solid-github</span>
   <Switch>
    <Match when={ownerQuery.isLoading}>Loading...</Match>
    <Match when={ownerQuery.isError}>Error...</Match>
    <Match when={ownerQuery.isSuccess}>
     <div class="flex gap-2 items-center">
      <Avatar.Root>
       <Avatar.Fallback>{$store.owner?.login.slice(0, 2)}</Avatar.Fallback>
       <Avatar.Image
        src={$store.owner?.avatar_url}
        alt="avatar"
        class="w-8 rounded-full"
       />
      </Avatar.Root>
      <span>{$store.owner?.login}</span>
     </div>
    </Match>
   </Switch>
  </header>
 );
}
