import { TRPCError, inferAsyncReturnType, initTRPC } from "@trpc/server";
import { CreateAWSLambdaContextOptions, awsLambdaRequestHandler } from "@trpc/server/adapters/aws-lambda";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { z } from "zod";
import { createChimeMeeting, endChimeMeeting, joinChimeMeeting } from "../chime";
// @ts-ignore
import { prisma } from "/opt/client";
import { CognitoJwtVerifier } from "aws-jwt-verify";

async function getUserId(access_token: string) {
  const verifier = CognitoJwtVerifier.create({
    userPoolId: "eu-central-1_3JGV6ob34",
    tokenUse: "access",
    clientId: "3cermrrihd00fn1742frogg4ip",
  });

  try {
    const payload = await verifier.verify(access_token);

    return payload.sub;
  } catch {
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

    const meetingInfo = await createChimeMeeting();

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
    return prisma.user.findUnique({ where: { id: ctx.userId } });
  }),

  getMeeting: publicProcedure.input(z.object({ meetingId: z.string().uuid() })).query(async ({ ctx, input }) => {
    const { meetingId } = input;

    return prisma.meeting.findUnique({ where: { id: meetingId } });
  }),

  addMeetingToDB: publicProcedure.input(z.object({ id: z.string(), data: z.string() })).mutation(async ({ ctx, input }) => {
    const { id, data } = input;
    return prisma.meeting.create({ data: { id, data } });
  }),
});

export type AppRouter = typeof appRouter;

export const trpc = awsLambdaRequestHandler({
  router: appRouter,
  createContext,
  responseMeta: () => {
    return {
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        "Access-Control-Allow-Credentials": "true",
      },
    };
  },
});
