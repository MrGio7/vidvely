import { FC, useState } from "react";

import {
  Attendees,
  AudioInputControl,
  AudioOutputControl,
  Badge,
  ControlBar,
  ControlBarButton,
  Grid,
  LocalVideo,
  MeetingStatus,
  NavbarItem,
  Phone,
  RemoteVideo,
  RemoteVideos,
  RosterAttendee,
  RosterCell,
  RosterGroup,
  VideoInputControl,
  VideoTileGrid,
  useMeetingManager,
  useMeetingStatus,
  useRosterState,
} from "amazon-chime-sdk-component-library-react";
import { CopySVG } from "../assets/SVG";

const Meeting: FC = () => {
  const [areAttendeesShown, setAreAttendeesShown] = useState(true);
  const meetingManager = useMeetingManager();
  const { roster } = useRosterState();
  const attendees = Object.values(roster);

  const attendeeItems = attendees.map(({ chimeAttendeeId }) => <RosterAttendee key={chimeAttendeeId} attendeeId={chimeAttendeeId} />);

  const clickedEndMeeting = async () => {
    const meetingId = meetingManager.meetingId;
    if (meetingId) {
      await meetingManager.leave();
    }
  };

  return (
    <main className={`flex h-[100dvh] w-full flex-col items-center justify-between`}>
      {areAttendeesShown && (
        // @ts-ignore
        <RosterGroup className="absolute top-4 right-2">{attendeeItems}</RosterGroup>
      )}

      {/* @ts-ignore */}
      <VideoTileGrid layout="standard" className="h-full !bg-gray-900" />
      <button className="absolute top-5 left-5 text-[whitesmoke] focus:text-green-500" onClick={() => navigator.clipboard.writeText(window.location.href.toString())}>
        <CopySVG />
      </button>
      <ControlBar className="!relative !border-gray-800 !bg-gray-900" layout="bottom" showLabels>
        <AudioInputControl className="text-indigo-200" />
        <VideoInputControl />
        <AudioOutputControl />
        <div className="relative">
          <Badge className="absolute -top-2 right-2" value={attendees.length} />
          <ControlBarButton icon={<Attendees />} onClick={() => setAreAttendeesShown((prevState) => !prevState)} label="Attendees" />
        </div>

        <ControlBarButton icon={<Phone />} onClick={clickedEndMeeting} label="End" />
      </ControlBar>
    </main>
  );
};

export default Meeting;
