import { createTRPCProxyClient, createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "../../../server/src/appRouter";

export const trpc = createTRPCReact<AppRouter>();
export const trpcProxy = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      // url: "http://localhost:3000/dev",
      url: "https://8m52d30ic9.execute-api.eu-central-1.amazonaws.com",
    }),
  ],
});
