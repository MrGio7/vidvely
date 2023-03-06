import { createTRPCProxyClient, createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/src/appRouter";
import trpcConfig from "../config/trpc.config";

export const trpc = createTRPCReact<AppRouter>();
export const trpcProxy = createTRPCProxyClient<AppRouter>(trpcConfig);
