import { router } from "src";
import { meetingRouter } from "./meeting.router";
import { userRouter } from "./user.router";
import { authRouter } from "./auth.router";

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  meeting: meetingRouter,
});

export type AppRouter = typeof appRouter;
