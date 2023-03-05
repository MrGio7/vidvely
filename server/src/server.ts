import { PrismaClient } from "@prisma/client";
import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import { CreateAWSLambdaContextOptions, awsLambdaRequestHandler } from "@trpc/server/adapters/aws-lambda";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import axios from "axios";
import { z } from "zod";
import { createChimeMeeting, endChimeMeeting, joinChimeMeeting } from "./chime";

interface AuthData {
  id_token: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export const prisma = new PrismaClient();

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

  createMeeting: publicProcedure
    .input(
      z.object({
        name: z.string(),
        title: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return createChimeMeeting({
          name: input.name,
          title: input.title,
        });
      } catch (error) {
        console.error(error);

        throw new Error("create meeting error");
      }
    }),

  joinMeeting: publicProcedure
    .input(
      z.object({
        meetingId: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return joinChimeMeeting({ ...input });
      } catch (error) {
        console.error(error);

        throw new Error("join meeting error");
      }
    }),

  endMeeting: publicProcedure.input(z.object({ meetingId: z.string() })).mutation(async ({ ctx, input }) => {
    try {
      return endChimeMeeting(input.meetingId);
    } catch (error) {
      console.error(error);

      return {
        error: "end meeting error",
      };
    }
  }),

  getUserFromDB: publicProcedure.input(z.object({ userId: z.string() })).query(async ({ ctx, input }) => {
    return prisma.user.findUnique({ where: { id: input.userId } });
  }),

  getMeetingFromDB: publicProcedure.input(z.object({ title: z.string() })).query(async ({ ctx, input }) => {
    return prisma.meeting.findFirst({ where: { title: input.title } });
  }),

  addUserToDB: publicProcedure.input(z.object({ id: z.string(), name: z.string() })).mutation(async ({ ctx, input }) => {
    try {
      return prisma.user.create({
        data: {
          id: input.id,
          firstName: input.name,
        },
      });
    } catch (error) {
      console.error(error);

      throw new Error("Internal Server Error");
    }
  }),

  addMeetingToDB: publicProcedure.input(z.object({ id: z.string(), title: z.string(), data: z.string() })).mutation(async ({ ctx, input }) => {
    try {
      return prisma.meeting.create({ data: { ...input } });
    } catch (error) {
      console.error(error);

      throw new Error("Internal Server Error");
    }
  }),
});

export type AppRouter = typeof appRouter;

export const handler = awsLambdaRequestHandler({
  router: appRouter,
  createContext,
});
