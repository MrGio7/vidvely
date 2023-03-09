import { TRPCError, inferAsyncReturnType, initTRPC } from "@trpc/server";
import { CreateAWSLambdaContextOptions, awsLambdaRequestHandler } from "@trpc/server/adapters/aws-lambda";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { z } from "zod";
import { createChimeMeeting, endChimeMeeting, joinChimeMeeting } from "../chime";
// @ts-ignore
import { prisma } from "/opt/client";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { Meeting, User } from "@prisma/client";

async function getUserId(access_token: string) {
  const verifier = CognitoJwtVerifier.create({
    userPoolId: "eu-central-1_3JGV6ob34",
    tokenUse: "access",
    clientId: "3cermrrihd00fn1742frogg4ip",
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
  const access_token = event.cookies?.find((cookie) => cookie.startsWith("access_token"))?.substring(13);

  if (!access_token) throw new TRPCError({ code: "UNAUTHORIZED" });

  const userId = await getUserId(access_token);

  return {
    userId,
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

  userInfo: publicProcedure.query(async ({ ctx }) => {
    try {
      const user: User = await prisma.user.findUniqueOrThrow({ where: { id: ctx.userId } });

      return user;
    } catch (error) {
      console.error(error);

      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  getMeeting: publicProcedure.input(z.object({ meetingId: z.string().uuid() })).query(async ({ ctx, input }) => {
    const { meetingId } = input;

    const meeting: Meeting | null = await prisma.meeting.findUnique({ where: { id: meetingId } });

    return meeting;
  }),
});

export type AppRouter = typeof appRouter;

export const trpc = awsLambdaRequestHandler({
  router: appRouter,
  createContext,
  responseMeta: () => {
    return {
      headers: {
        "Access-Control-Allow-Headers": "Authorization,Content-Type,x-amz-date,x-api-key,x-amz-security-token,x-amz-user-agent,x-amzn-trace-id",
        "Access-Control-Allow-Origin": "https://vidvely.vercel.app",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        "Access-Control-Allow-Credentials": "true",
      },
    };
  },
});
