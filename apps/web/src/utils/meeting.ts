import { trpcProxy } from "./trpc";

export async function getAttendee(chimeAttendeeId: string, externalUserId?: string) {
  return {
    name: await trpcProxy(token).getUserName.query({
      userId: externalUserId || chimeAttendeeId,
    }),
  };
}
