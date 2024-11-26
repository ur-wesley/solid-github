import { invoke } from "@tauri-apps/api/core";
import AppStore from "./Store.ts";

export async function Login(url: string, state: string) {
  const code = extractCode(url);
  const stateParam = new URL(url).searchParams.get("state");
  if (code && stateParam === state) {
    const store = AppStore.getInstance();
    const accessToken: string = await invoke("get_github_access_token", {
      code,
    });
    await store.set("token", accessToken);
  }
}

export async function Logout() {
  const store = AppStore.getInstance();
  await store.set("token", null);
}

function extractCode(url: string) {
  return new URL(url).searchParams.get("code");
}