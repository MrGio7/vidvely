import { TRPCError, inferAsyncReturnType, initTRPC } from "@trpc/server";
import { CreateAWSLambdaContextOptions, awsLambdaRequestHandler } from "@trpc/server/adapters/aws-lambda";
import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import { createChimeMeeting, endChimeMeeting, joinChimeMeeting } from "../chime";
// @ts-ignore
import { prisma } from "/opt/client";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import middy from "@middy/core";
import cors from "@middy/http-cors";

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

async function createContext({ event, context }: CreateAWSLambdaContextOptions<APIGatewayProxyEventV2>) {
  const access_token = event.headers.Authorization ?? event.headers.authorization ?? null;

  if (!access_token) throw new TRPCError({ code: "UNAUTHORIZED" });

  const userId = await getUserId(access_token);

  return {
    userId,
    httpMethod: event.requestContext.http.method,
  };
}

type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  createMeeting: publicProcedure.mutation(async ({ ctx, input }) => {
    const { userId } = ctx;

    const meetingInfo = await createChimeMeeting({ userId });

    if (!meetingInfo.Meeting) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: "meeting id is not defined" });

    await prisma.meeting.create({
      data: {
        id: meetingInfo.Meeting.MeetingId,
        data: JSON.stringify(meetingInfo),
        users: { connect: { id: userId } },
      },
    });

    return meetingInfo;
  }),

  joinMeeting: publicProcedure
    .input(
      z.object({
        meetingId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { meetingId } = input;

      await prisma.user.update({ where: { id: userId }, data: { meetings: { connect: { id: meetingId } } } });

      return joinChimeMeeting({ meetingId, userId });
    }),

  endMeeting: publicProcedure.input(z.object({ meetingId: z.string() })).mutation(async ({ ctx, input }) => {
    const { meetingId } = input;

    await endChimeMeeting(meetingId);

    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: "ENDED" },
    });
  }),

  findOrCreateUser: publicProcedure.input(z.object({ email: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const { userId } = ctx;
    const { email } = input;

    const user = (await prisma.user.findUnique({ where: { id: userId } })) || (await prisma.user.create({ data: { id: userId, email } }));

    return user;
  }),

  getMeeting: publicProcedure.input(z.object({ meetingId: z.string().uuid() })).query(async ({ ctx, input }) => {
    const { meetingId } = input;

    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });

    return meeting;
  }),
});

export type AppRouter = typeof appRouter;

const setOptionsResMiddleware = (): middy.MiddlewareObj<APIGatewayProxyEventV2, APIGatewayProxyResult> => {
  const before: middy.MiddlewareFn<APIGatewayProxyEventV2, APIGatewayProxyResult> = async (request): Promise<void> => {
    // Your middleware logic
  };

  const after: middy.MiddlewareFn<APIGatewayProxyEventV2, APIGatewayProxyResult> = async (request): Promise<APIGatewayProxyResult | void> => {
    if (request.event.requestContext.http.method === "OPTIONS")
      return {
        statusCode: 200,
        body: "",
      };
  };

  return {
    before,
    after,
  };
};

export const trpc = middy()
  .handler(
    awsLambdaRequestHandler({
      router: appRouter,
      createContext,
    })
  )
  .use(setOptionsResMiddleware())
  .use(
    cors({
      credentials: true,
      headers: "Authorization,Content-Type,x-amz-date,x-api-key,x-amz-security-token,x-amz-user-agent,x-amzn-trace-id",
      methods: "OPTIONS,POST,GET",
      origins: ["https://vidvely.vercel.app", "http://localhost:3000"],
    })
  );
