import { TRPCError, inferAsyncReturnType, initTRPC } from "@trpc/server";
import { CreateAWSLambdaContextOptions } from "@trpc/server/adapters/aws-lambda";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { appRouter } from "./router";

async function getUserId(access_token: string) {
  const verifier = CognitoJwtVerifier.create({
    userPoolId: "eu-central-1_3JGV6ob34",
    tokenUse: "access",
    clientId: "389ia6feqe77a0gbf15c3dudbp",
  });
  try {
    const payload = await verifier.verify(access_token);

    return payload.sub;
  } catch (err) {
    console.error(err);

    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
}

export async function createContext({ event, context }: CreateAWSLambdaContextOptions<APIGatewayProxyEventV2>) {
  const access_token = event.headers.Authorization || event.headers.authorization || null;

  const userId = access_token && (await getUserId(access_token));

  return {
    userId,
    httpMethod: event.requestContext.http.method,
  };
}

type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

export const publicProcedure = t.procedure;
export const router = t.router;

const middleware = t.middleware;

const authMiddleware = middleware(async ({ ctx, next }) => {
  const { userId } = ctx;

  if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

  return next({ ctx: { ...ctx, userId } });
});

export const protectedProcedure = publicProcedure.use(authMiddleware);
