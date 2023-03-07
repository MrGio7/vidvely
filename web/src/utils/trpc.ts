import { CreateTRPCClientOptions, createTRPCProxyClient, createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "../../../server/src/appRouter";

export const trpcConfig: CreateTRPCClientOptions<AppRouter> = {
  links: [
    httpBatchLink({
      url: import.meta.env.VITE_API_URL,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
};

export const trpc = createTRPCReact<AppRouter>();
export const trpcProxy = createTRPCProxyClient<AppRouter>(trpcConfig);
