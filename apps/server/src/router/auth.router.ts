import { publicProcedure, router } from "src";
import { authCodeHandler, refreshTokenHandler } from "src/services/auth.service";
import { z } from "zod";

export const authRouter = router({
  greet: publicProcedure.query(() => "hello"),
  signIn: publicProcedure.input(z.string().nonempty()).mutation(async ({ ctx, input: code }) => {
    return authCodeHandler(code);
  }),

  refreshAccessToken: publicProcedure.input(z.string().nonempty()).mutation(async ({ ctx, input: refreshToken }) => {
    return refreshTokenHandler(refreshToken);
  }),
});
