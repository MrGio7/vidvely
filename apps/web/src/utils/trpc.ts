import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type { AppRouter } from "@vidvely/server";

function getBaseUrl() {
  if (typeof window !== "undefined")
    // browser should use relative path
    return "";
  if (process.env.VERCEL_URL)
    // reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  if (process.env.RENDER_INTERNAL_HOSTNAME)
    // reference for render.com
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;
  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const trpc = (token: string) =>
  createTRPCNext<AppRouter>({
    config() {
      return {
        links: [
          httpBatchLink({
            /**
             * If you want to use SSR, you need to use the server's full URL
             * @link https://trpc.io/docs/ssr
             **/
            url: `http://localhost:4000`,
            headers: () => {
              return {
                Authorization: token,
              };
            },
          }),
        ],
        /**
         * @link https://tanstack.com/query/v4/docs/reference/QueryClient
         **/
        // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
      };
    },
    /**
     * @link https://trpc.io/docs/ssr
     **/
    ssr: false,
  });

export const trpcProxy = (token: string) =>
  createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        /**
         * If you want to use SSR, you need to use the server's full URL
         * @link https://trpc.io/docs/ssr
         **/
        url: `http://localhost:4000`,
        headers: () => {
          return {
            Authorization: token,
          };
        },
      }),
    ],
  });
