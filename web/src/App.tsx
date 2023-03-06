import { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import trpcConfig from "./config/trpc.config";
import { trpc } from "./utils/trpc";

import Root from "./pages";
import Meeting from "./pages/meeting";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
  },
  {
    path: "/meeting",
    element: <Meeting />,
  },
]);

export function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => trpc.createClient(trpcConfig));

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
