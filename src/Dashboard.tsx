import { For, Match, onMount, Show, Switch } from "solid-js";
import { useApi } from "./Api.tsx";
import { createBaseDir, readConfig } from "./tauriHelper.ts";
import { createQuery } from "@tanstack/solid-query";
import Header from "./components/Header.tsx";

export default function Dashboard() {
 const [$store, { setToken, fetchRepos }] = useApi();

 onMount(async () => {
  await createBaseDir();
  const config = await readConfig();
  if (config.token) setToken(config.token);
 });

 const repoQuery = createQuery(() => ({
  queryKey: ["repos"],
  queryFn: fetchRepos,
 }));

 return (
  <div>
   <Header />
   <Show when={$store.token === null}>
    <input
     type="text"
     placeholder="Token"
     onInput={(e) => setToken(e.currentTarget.value)}
    />
   </Show>
   <Switch>
    <Match when={repoQuery.isLoading}>Loading...</Match>
    <Match when={repoQuery.isError}>Error...</Match>
    <Match when={repoQuery.isSuccess}>
     <div class="flex flex-col gap-2">
      <For each={$store.repositories}>{({ name }) => <div>{name}</div>}</For>
     </div>
    </Match>
   </Switch>
  </div>
 );
}
