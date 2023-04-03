import { publicProcedure, router } from "../";
import { authCodeHandler, refreshTokenHandler } from "../services/auth.service";
import { z } from "zod";

export const authRouter = router({
  signIn: publicProcedure.input(z.object({ code: z.string().nonempty(), redirectUrl: z.string().nonempty() })).mutation(async ({ ctx, input }) => {
    return authCodeHandler({
      authCode: input.code,
      redirectUrl: input.redirectUrl,
    });
  }),

  refreshAccessToken: publicProcedure.input(z.string().nonempty()).mutation(async ({ ctx, input: refreshToken }) => {
    return refreshTokenHandler(refreshToken);
  }),
});
