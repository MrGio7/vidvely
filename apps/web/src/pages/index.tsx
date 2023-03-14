import {
  MeetingStatus,
  useMeetingManager,
  useMeetingStatus,
} from "amazon-chime-sdk-component-library-react";
import { MeetingSessionConfiguration } from "amazon-chime-sdk-js";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  type NextPage,
} from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { LoadingSVG } from "~/assets/SVG";
import Meeting from "~/components/Meeting";
import { env } from "~/env.mjs";
import { getServerAuthSession } from "~/server/auth";
import { User } from "~/types/user";
import { trpcOutput, trpcProxy } from "~/utils/trpc";

export const getServerSideProps: GetServerSideProps<{
  user: User;
  token: string;
  meeting: trpcOutput["getMeeting"];
}> = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  const meetingId = ctx.query.meetingId as string | undefined;

  if (!session)
    return {
      redirect: {
        destination:
          "/auth/signin" + (meetingId ? `?meetingId=${meetingId}` : ""),
        permanent: false,
      },
    };

  const { token, user } = session;

  const meeting = !!meetingId
    ? await trpcProxy(token).getMeeting.query({ meetingId })
    : null;

  return {
    props: {
      user,
      token,
      meeting,
    },
  };
};

const Home: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ user, token, meeting }) => {
  const meetingManager = useMeetingManager();
  const meetingStatus = useMeetingStatus();
  const router = useRouter();

  const joinMeeting = async () => {
    meetingManager.getAttendee = async (
      chimeAttendeeId: string,
      externalUserId?: string
    ) => ({
      name: !!user.firstName
        ? user.firstName + " " + user.lastName
        : user.email,
    });

    if (!meeting) return;

    try {
      const joinInfo = await trpcProxy(token).joinMeeting.mutate({
        meetingId: meeting.id,
      });

      const meetingSessionConfiguration = new MeetingSessionConfiguration(
        JSON.parse(meeting.data),
        joinInfo.Attendee
      );

      await meetingManager.join(meetingSessionConfiguration);
    } catch (error) {
      console.log(error);
    }

    // At this point you can let users setup their devices, or start the session immediately
    await meetingManager.start();
  };

  const createMeeting = async () => {
    try {
      const joinInfo = await trpcProxy(token).createMeeting.mutate();

      router.push(
        { query: { meetingId: joinInfo.Meeting?.MeetingId } },
        undefined,
        { shallow: true }
      );

      const meetingSessionConfiguration = new MeetingSessionConfiguration(
        joinInfo.Meeting,
        joinInfo.Attendee
      );

      await meetingManager.join(meetingSessionConfiguration);
    } catch (error) {
      console.error(error);
    }

    await meetingManager.start();
  };

  useEffect(() => {
    console.log({ user, token });

    if (!meeting) createMeeting();
    if (!!meeting) joinMeeting();
  }, []);

  if (meetingStatus === MeetingStatus.Loading) return <LoadingSVG />;

  return (
    <>
      <main className={`flex h-[100dvh] flex-col items-center justify-center`}>
        <Meeting />
      </main>
    </>
  );
};

export default Home;
