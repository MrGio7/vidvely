import { createContext, useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcConfig } from "./utils/trpc";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./pages";

import Auth from "./pages/auth";
import { LoadingSVG } from "./assets/SVG";

interface AppContextPayload {
  user?: User;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
}

interface User {
  id: string;
  email: string;
}

export const AppContext = createContext<AppContextPayload>({
  setUser: () => {},
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
  },
]);

export function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => trpc.createClient(trpcConfig));
  const [user, setUser] = useState<User>();

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppContext.Provider value={{ user, setUser }}>
          <Auth />
          {!user && <LoadingSVG className="absolute w-32 h-32 top-[calc(50%-4rem)] left-[calc(50%-4rem)]" />}
          {!!user && <RouterProvider router={router} />}
        </AppContext.Provider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
