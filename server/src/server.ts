import { PrismaClient } from "@prisma/client";
import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import { CreateAWSLambdaContextOptions, awsLambdaRequestHandler } from "@trpc/server/adapters/aws-lambda";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import axios from "axios";
import { z } from "zod";

interface AuthData {
  id_token: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

function createContext({ event, context }: CreateAWSLambdaContextOptions<APIGatewayProxyEventV2>) {
  return {
    event: event,
    apiVersion: (event as { version?: string }).version || "1.0",
    user: event.headers["x-user"],
  };
}

type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  greet: publicProcedure.input(z.object({ name: z.string() })).query(async ({ input, ctx }) => {
    return `Greeting, ${input.name}. x-user?: ${ctx.user}.`;
  }),

  auth: publicProcedure.input(z.object({ code: z.string().uuid() })).query(async ({ ctx, input }) => {
    try {
      const authCode = input.code;

      const authData: AuthData = await axios
        .post(
          "https://vidvaley-dev.auth.eu-central-1.amazoncognito.com/oauth2/token",
          {
            grant_type: "authorization_code",
            client_id: "3cermrrihd00fn1742frogg4ip",
            code: authCode,
            redirect_uri: "http://localhost:5173/auth/",
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        )
        .then((res) => res.data)
        .catch((err) => {
          console.error(err.response.data);
          throw new Error("auth error");
        });

      return authData;
    } catch (error) {
      console.log(error);

      return {
        error: "auth error",
      };
    }
  }),
});

export const prisma = new PrismaClient();

export type AppRouter = typeof appRouter;

export const handler = awsLambdaRequestHandler({
  router: appRouter,
  createContext,
});
