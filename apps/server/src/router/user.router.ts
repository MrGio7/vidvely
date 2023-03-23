import { protectedProcedure, router } from "../";
import { z } from "zod";
//@ts-ignore
import { prisma } from "/opt/client";

export const userRouter = router({
  getUserName: protectedProcedure.input(z.object({ userId: z.string().uuid() })).query(async ({ input }) => {
    const { userId } = input;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    return !!user?.firstName ? user.firstName + (!!user?.lastName ? " " + user.lastName : "") : user?.email ?? "Guest";
  }),

  getUserInfo: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;

    return prisma.user.findUniqueOrThrow({ where: { id: userId } });
  }),

  updateUser: protectedProcedure.input(z.object({ firstName: z.string(), lastName: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const { userId } = ctx;
    const { firstName, lastName } = input;

    const user = await prisma.user.update({ where: { id: userId }, data: { firstName, lastName } });

    return user;
  }),
});
