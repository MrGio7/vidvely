import { protectedProcedure, router } from "../";
import { z } from "zod";
//@ts-ignore
import { prisma } from "/opt/client";

export const userRouter = router({
  findOrCreateUser: protectedProcedure.input(z.object({ email: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const { userId } = ctx;
    const { email } = input;

    const user = (await prisma.user.findUnique({ where: { id: userId } })) || (await prisma.user.create({ data: { id: userId, email } }));

    return user;
  }),

  getUserName: protectedProcedure.input(z.object({ userId: z.string().uuid() })).query(async ({ ctx, input }) => {
    const { userId } = input;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    return !!user?.firstName ? user.firstName + (!!user?.lastName ? " " + user.lastName : "") : user?.email ?? "Guest";
  }),
});
