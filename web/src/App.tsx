import { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import trpcConfig from "./config/trpc.config";
import { trpc } from "./utils/trpc";

import IndexPage from "./pages";

export function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => trpc.createClient(trpcConfig));

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <IndexPage />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
