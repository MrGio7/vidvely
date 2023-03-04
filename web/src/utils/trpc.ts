import { createTRPCProxyClient, createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "../../../server/src/appRouter";

export const trpc = createTRPCReact<AppRouter>();
export const trpcProxy = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000",
    }),
  ],
});
