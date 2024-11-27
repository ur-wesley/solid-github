import {
 createResource,
 createSignal,
 Match,
 onMount,
 Show,
 Switch,
} from "solid-js";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { invoke } from "@tauri-apps/api/core";
import ApiProvider from "./Api.tsx";
import AppStore from "./Store.ts";

import "uno.css";
import "virtual:uno.css";
import "./App.css";
import { Login } from "./Auth.ts";
import Header from "./components/Header.tsx";
import Content from "./components/Content.tsx";
import Sidebar from "./components/Sidebar.tsx";
import { getCurrentWindow } from "@tauri-apps/api/window";

const queryClient = new QueryClient();

async function getLoginUrl() {
 const state = Math.random().toString(36).substring(2);
 const loginUrl: string = await invoke("start_github_login", {
  randomState: state,
 });
 return { loginUrl, state };
}

function App() {
 const [accessToken, setAccessToken] = createSignal<string | null>(null);
 const [loginUrl] = createResource(getLoginUrl);

 onMount(async () => {
  const appStore = AppStore.getInstance();
  let token = await appStore.get<string | null | undefined>("token");
  while (token === undefined) {
   await new Promise((resolve) => setTimeout(resolve, 100));
   token = await appStore.get<string | null | undefined>("token");
  }

  if (token) setAccessToken(token);
  console.log({ init: token });

  const unsubscribeToken = await appStore.listen("token", (token) => {
   console.log({ update: token });
   setAccessToken(token);
  });

  const unlistenUrls = await onOpenUrl(async (urls) => {
   console.log(urls);
   for (const url of urls) {
    if (url.startsWith("solid-github://login-success")) {
     console.log(loginUrl.state);
     if (loginUrl.state !== "ready") return;
     await Login(url, loginUrl().state);
    }
   }
  });

  return () => {
   unlistenUrls();
   unsubscribeToken?.();
  };
 });

 return (
  <main class="bg-background text-foreground h-screen w-screen overflow-hidden">
   <Show
    when={accessToken()}
    fallback={
     <Switch>
      <Match when={loginUrl.state === "pending"}>
       <div class="w-full h-full grid place-content-center">
        <div class="spinner" />
       </div>
      </Match>
      <Match when={loginUrl.state === "errored"}>
       <div class="w-full h-full grid place-content-center">
        <div
         class="text-white
          text-center"
        >
         Error loading login URL
        </div>
       </div>
      </Match>
      <Match when={loginUrl.state === "ready"}>
       <LoginButton url={loginUrl()!.loginUrl} />
      </Match>
     </Switch>
    }
   >
    <ApiProvider token={accessToken()!}>
     <QueryClientProvider client={queryClient}>
      <Layout />
     </QueryClientProvider>
    </ApiProvider>
   </Show>
  </main>
 );
}

function LoginButton(props: { url: string }) {
 return (
  <div class="absolute w-full h-full grid place-content-center">
   <a
    href={props.url}
    target="_blank"
    class="bg-gray-800 text-white hover:bg-gray-700 transition px-4 py-2 rounded-lg flex gap-2 items-center decoration-none"
   >
    <i class="i-mdi-github p-4 font-white" />
    <span>Login with GitHub</span>
   </a>
  </div>
 );
}

function Layout() {
 const [isExpanded, setIsExpanded] = createSignal(true);

 onMount(async () => {
  const unlisten = await getCurrentWindow().onResized(({ payload: size }) => {
   setIsExpanded(size.width > 1200);
  });
  return () => {
   unlisten();
  };
 });

 {
  /* <div id="layout" > */
 }
 return (
  <div
   class=""
   style={{
    display: "grid",
    "grid-template-areas": '"header header" "sidebar content"',
    "grid-template-columns": "auto 1fr",
    "grid-template-rows": "auto 1fr",
   }}
  >
   <Header onExpand={setIsExpanded} expanded={isExpanded()} />
   <Sidebar expanded={isExpanded()} />
   <Content />
  </div>
 );
}

export default App;
