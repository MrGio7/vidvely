import { MeetingStatus, useMeetingStatus } from "amazon-chime-sdk-component-library-react";
import Meeting from "../components/Meeting";
import MeetingForm from "../components/MeetingForm";

export default function IndexPage() {
  const meetingStatus = useMeetingStatus();

  return (
    <main className="h-[100dvh] flex flex-col items-center justify-between">
      {meetingStatus !== MeetingStatus.Succeeded && <MeetingForm />}
      {meetingStatus !== MeetingStatus.Loading && <Meeting />}
    </main>
  );
}
