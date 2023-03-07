import { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcConfig } from "./utils/trpc";

import Root from "./pages";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { parseCookies, setCookie } from "nookies";
import Auth from "./pages/auth";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
  },
  {
    path: "/auth",
    element: <Auth />,
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
