import { CreateTRPCClientOptions, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../server/src/appRouter";

export default {
  links: [
    httpBatchLink({
      url: import.meta.env.VITE_API_URL,
    }),
  ],
} as CreateTRPCClientOptions<AppRouter>;
