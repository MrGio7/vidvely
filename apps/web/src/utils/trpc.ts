import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@vidvely/server";
import { env } from "~/env.mjs";

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

let accessToken: string;

export function setAccessToken(newAccessToken: string) {
  accessToken = newAccessToken;
}

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url: env.NEXT_PUBLIC_TRPC_ORIGIN,
          headers() {
            return {
              Authorization: accessToken || "",
            };
          },
        }),
      ],
    };
  },
  ssr: false,
});

export const trpcProxy = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: env.NEXT_PUBLIC_TRPC_ORIGIN,
      headers: () => {
        return {
          Authorization: accessToken || "",
        };
      },
    }),
  ],
});

export type trpcInput = inferRouterInputs<AppRouter>;
export type trpcOutput = inferRouterOutputs<AppRouter>;
