import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../";
import { createChimeMeeting, endChimeMeeting, joinChimeMeeting } from "../chime";
import { z } from "zod";
import { db } from "@vidvely/db";
import { MeetingStatus } from "@vidvely/db/src/schema/meeting/meeting.type";

export const meetingRouter = router({
  createMeeting: protectedProcedure.mutation(async ({ ctx, input }) => {
    const { userId } = ctx;

    const meetingInfo = await createChimeMeeting({ userId });

    if (!meetingInfo.Meeting) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: "meeting id is not defined" });

    await db.meeting.create({
      id: meetingInfo.Meeting.MeetingId!,
      data: JSON.stringify(meetingInfo),
      userId,
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

      await db.user.update({ id: userId, meetingId });

      return joinChimeMeeting({ meetingId, userId });
    }),

  endMeeting: protectedProcedure.input(z.object({ meetingId: z.string() })).mutation(async ({ ctx, input }) => {
    const { meetingId } = input;

    await endChimeMeeting(meetingId);

    await db.meeting.update({
      id: meetingId,
      status: MeetingStatus.COMPLETED,
    });
  }),

  getMeeting: protectedProcedure.input(z.object({ meetingId: z.string().uuid() })).query(async ({ ctx, input }) => {
    const { meetingId } = input;

    const meeting = await db.meeting.find(meetingId);

    return meeting;
  }),
});
