import { Accessor, createRoot, createSignal } from "solid-js";
import { load } from "@tauri-apps/plugin-store";

// type AuthStore = {
//  loggedIn: boolean;
//  token: string | null;
// };

type AuthStoreMethods = {
 Login: (token: string) => Promise<void>;
 Logout: () => Promise<void>;
 isLoggedIn: () => Promise<boolean>;
 isLoggedOut: () => Promise<boolean>;

 getToken: Accessor<string | null>;
};

const store = await load("auth.json");
const createAuthStore = (): AuthStoreMethods => {
 const [getToken, setToken] = createSignal<string | null>(null);

 async function Login(token: string) {
  await store.set("token", token);
  await store.set("loggedIn", true);
  setToken(token);
 }

 async function Logout() {
  await store.set("token", null);
  await store.set("loggedIn", false);
  setToken(null);
 }

 async function isLoggedIn() {
  return (await store.get<boolean>("loggedIn")) ?? false;
 }

 async function isLoggedOut() {
  return !((await store.get<boolean>("loggedIn")) ?? true);
 }

 return { Login, Logout, isLoggedIn, isLoggedOut, getToken };
};

export default createRoot(createAuthStore);
