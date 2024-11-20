import { ApiProvider } from "./Api.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import Dashboard from "./Dashboard.tsx";

import "uno.css";
import "virtual:uno.css";
import "./App.css";

const queryClient = new QueryClient();

function App() {
 return (
  <main class="bg-gray-600 h-screen w-screen overflow-auto">
   <ApiProvider>
    <QueryClientProvider client={queryClient}>
     <Dashboard />
    </QueryClientProvider>
   </ApiProvider>
  </main>
 );
}

export default App;
