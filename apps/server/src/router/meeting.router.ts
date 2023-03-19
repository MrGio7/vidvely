import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../";
import { createChimeMeeting, endChimeMeeting, joinChimeMeeting } from "../chime";
import { z } from "zod";
//@ts-ignore
import { prisma } from "/opt/client";

export const meetingRouter = router({
  createMeeting: protectedProcedure.mutation(async ({ ctx, input }) => {
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

  joinMeeting: protectedProcedure
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

  endMeeting: protectedProcedure.input(z.object({ meetingId: z.string() })).mutation(async ({ ctx, input }) => {
    const { meetingId } = input;

    await endChimeMeeting(meetingId);

    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: "ENDED" },
    });
  }),

  getMeeting: protectedProcedure.input(z.object({ meetingId: z.string().uuid() })).query(async ({ ctx, input }) => {
    const { meetingId } = input;

    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });

    return meeting;
  }),
});
