import {
  MeetingStatus,
  useMeetingStatus,
} from "amazon-chime-sdk-component-library-react";
import { type NextPage } from "next";
import { useContext } from "react";
import Meeting from "~/components/Meeting";
import MeetingForm from "~/components/MeetingForm";
import { AppContext } from "./_app";

const Home: NextPage = () => {
  const { user } = useContext(AppContext);
  const meetingStatus = useMeetingStatus();

  return (
    <>
      <header>user: {user.email}</header>
      <main className={`flex h-[100dvh] flex-col items-center justify-center`}>
        {meetingStatus !== MeetingStatus.Succeeded && <MeetingForm />}
        {meetingStatus === MeetingStatus.Succeeded && <Meeting />}
      </main>
    </>
  );
};

export default Home;
