import { MeetingStatus, useMeetingManager, useMeetingStatus } from "amazon-chime-sdk-component-library-react";
import { MeetingSessionConfiguration } from "amazon-chime-sdk-js";
import { GetServerSideProps, InferGetServerSidePropsType, type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { LoadingSVG } from "~/assets/SVG";
import Meeting from "~/components/Meeting";
import { User } from "~/types/user";
import { authenticateUser } from "~/utils/auth";
import { setAccessToken, trpcOutput, trpcProxy } from "~/utils/trpc";

export const getServerSideProps: GetServerSideProps<{
  user: Partial<User>;
  meeting: trpcOutput["meeting"]["getMeeting"];
  accessToken: string;
}> = async (ctx) => {
  const auth = await authenticateUser(ctx);

  if (!!auth.redirect) return auth;

  const meetingId = (ctx.query.meetingId as string | undefined) || (ctx.query.state as string | undefined);

  const meeting = !!meetingId ? await trpcProxy.meeting.getMeeting.query({ meetingId }) : null;
  const user = await trpcProxy.user.findOrCreateUser.mutate({});

  return {
    props: {
      user: {
        id: user.id,
        email: user.email,
      },
      meeting,
      accessToken: auth.accessToken,
    },
  };
};

const Home: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ user, meeting, accessToken }) => {
  setAccessToken(accessToken);
  const meetingManager = useMeetingManager();
  const meetingStatus = useMeetingStatus();
  const router = useRouter();

  const joinMeeting = async () => {
    if (!meeting) return;

    router.push({ query: { meetingId: meeting.id } }, undefined, { shallow: true });

    try {
      const joinInfo = await trpcProxy.meeting.joinMeeting.mutate({
        meetingId: meeting.id,
      });

      const meetingSessionConfiguration = new MeetingSessionConfiguration(JSON.parse(meeting.data), joinInfo.Attendee);

      await meetingManager.join(meetingSessionConfiguration);
    } catch (error) {
      console.error(error);
      throw new Error("Join Meeting");
    }

    // At this point you can let users setup their devices, or start the session immediately
    await meetingManager.start();
  };

  const createMeeting = async () => {
    try {
      const joinInfo = await trpcProxy.meeting.createMeeting.mutate();

      router.push({ query: { meetingId: joinInfo.Meeting?.MeetingId } }, undefined, { shallow: true });

      const meetingSessionConfiguration = new MeetingSessionConfiguration(joinInfo.Meeting, joinInfo.Attendee);

      await meetingManager.join(meetingSessionConfiguration);
    } catch (error) {
      console.error(error);
      throw new Error("Create Meeting");
    }

    await meetingManager.start();
  };

  useEffect(() => {
    meetingManager.getAttendee = async (chimeAttendeeId: string, externalUserId?: string) => ({
      name: await trpcProxy.user.getUserName.query({
        userId: externalUserId || chimeAttendeeId,
      }),
    });

    if (!!meeting) {
      joinMeeting();
    } else {
      createMeeting();
    }
  }, []);

  if (meetingStatus === MeetingStatus.Loading) return <LoadingSVG />;

  return <Meeting />;
};

export default Home;
