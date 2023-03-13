import {
  MeetingStatus,
  useMeetingStatus,
} from "amazon-chime-sdk-component-library-react";
import { type NextPage } from "next";
import { useEffect, useState } from "react";
import { LoadingSVG } from "~/assets/SVG";
import Meeting from "~/components/Meeting";
import MeetingForm from "~/components/MeetingForm";

const Home: NextPage = () => {
  const meetingStatus = useMeetingStatus();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (meetingStatus !== MeetingStatus.Loading) setLoading(false);
  }, [meetingStatus]);

  if (loading) return <LoadingSVG />;

  return (
    <>
      {/* <header>user: {user.email}</header> */}
      <main className={`flex h-[100dvh] flex-col items-center justify-center`}>
        {meetingStatus !== MeetingStatus.Succeeded && (
          <MeetingForm setLoading={setLoading} />
        )}
        {meetingStatus === MeetingStatus.Succeeded && <Meeting />}
      </main>
    </>
  );
};

export default Home;
