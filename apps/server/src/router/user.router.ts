import { db } from "@vidvely/db";
import { protectedProcedure, router } from "../";
import { z } from "zod";

export const userRouter = router({
  getUserName: protectedProcedure.input(z.object({ userId: z.string().uuid() })).query(async ({ input }) => {
    const { userId } = input;

    const user = await db.user.find(userId);

    return !!user?.firstName ? user.firstName + (!!user?.lastName ? " " + user.lastName : "") : user?.email ?? "Guest";
  }),

  getUserInfo: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;

    return db.user.find(userId);
  }),

  updateUser: protectedProcedure.input(z.object({ firstName: z.string(), lastName: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const { userId } = ctx;
    const { firstName, lastName } = input;

    const user = await db.user.update({
      id: userId,
      firstName,
      lastName,
    });

    return user;
  }),
});
