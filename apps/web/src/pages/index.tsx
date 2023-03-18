import { MeetingStatus, useMeetingManager, useMeetingStatus } from "amazon-chime-sdk-component-library-react";
import { MeetingSessionConfiguration } from "amazon-chime-sdk-js";
import { GetServerSideProps, InferGetServerSidePropsType, type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { LoadingSVG } from "~/assets/SVG";
import Meeting from "~/components/Meeting";
import { User } from "~/types/user";
import { authenticateUser } from "~/utils/auth";
import { trpcOutput, trpcProxy } from "~/utils/trpc";

export const getServerSideProps: GetServerSideProps<{
  user: User;
  meeting: trpcOutput["getMeeting"];
}> = async (ctx) => {
  await authenticateUser(ctx);
  const meetingId = ctx.query.meetingId as string | undefined;

  const meeting = !!meetingId ? await trpcProxy.getMeeting.query({ meetingId }) : null;
  const user = await trpcProxy.findOrCreateUser.mutate({});

  return {
    props: {
      user,
      meeting,
    },
  };
};

const Home: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ user, meeting }) => {
  const meetingManager = useMeetingManager();
  const meetingStatus = useMeetingStatus();
  const router = useRouter();

  useEffect(() => {
    meetingManager.getAttendee = async (chimeAttendeeId: string, externalUserId?: string) => ({
      name: await trpcProxy.getUserName.query({
        userId: externalUserId || chimeAttendeeId,
      }),
    });
  }, []);

  const joinMeeting = async () => {
    if (!meeting) return;

    try {
      const joinInfo = await trpcProxy.joinMeeting.mutate({
        meetingId: meeting.id,
      });

      const meetingSessionConfiguration = new MeetingSessionConfiguration(JSON.parse(meeting.data), joinInfo.Attendee);

      await meetingManager.join(meetingSessionConfiguration);
    } catch (error) {
      console.log(error);
    }

    // At this point you can let users setup their devices, or start the session immediately
    await meetingManager.start();
  };

  const createMeeting = async () => {
    try {
      const joinInfo = await trpcProxy.createMeeting.mutate();

      router.push({ query: { meetingId: joinInfo.Meeting?.MeetingId } }, undefined, { shallow: true });

      const meetingSessionConfiguration = new MeetingSessionConfiguration(joinInfo.Meeting, joinInfo.Attendee);

      await meetingManager.join(meetingSessionConfiguration);
    } catch (error) {
      console.error(error);
    }

    await meetingManager.start();
  };

  useEffect(() => {
    if (!meeting) createMeeting();
    if (!!meeting) joinMeeting();
  }, []);

  if (meetingStatus === MeetingStatus.Loading) return <LoadingSVG />;

  return <Meeting />;
};

export default Home;
