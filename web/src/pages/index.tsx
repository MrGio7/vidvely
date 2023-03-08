import { MeetingStatus, useMeetingStatus } from "amazon-chime-sdk-component-library-react";
import Meeting from "../components/Meeting";
import MeetingForm from "../components/MeetingForm";
import { useContext } from "react";
import { AppContext } from "../App";

export default function MeetingPage() {
  const meetingStatus = useMeetingStatus();
  const { user } = useContext(AppContext);

  function logoutHandler() {
    fetch("http://localhost:3000/logout", {
      method: "POST",
      credentials: "include",
    }).then((res) => {
      if (res.status === 200) {
        window.location.replace(
          `https://vidvaley-dev.auth.eu-central-1.amazoncognito.com/logout?client_id=3cermrrihd00fn1742frogg4ip&response_type=code&scope=email+openid+phone&redirect_uri=${
            new URL(import.meta.url).origin
          }/auth/`
        );
      }
    });
  }

  console.log(meetingStatus);

  return (
    <main className={`h-[100dvh] flex flex-col items-center justify-center`}>
      {/* <h1>user id: {user?.id}</h1>
      <h1>email: {user?.email}</h1>
      <button onClick={logoutHandler}>LOG OUT</button> */}
      {meetingStatus !== MeetingStatus.Succeeded && <MeetingForm />}
      {meetingStatus === MeetingStatus.Succeeded && <Meeting />}
    </main>
  );
}
