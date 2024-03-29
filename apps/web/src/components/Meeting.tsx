import { FC, useState } from "react";

import { Attendees, AudioInputControl, AudioOutputControl, Badge, ControlBar, ControlBarButton, Share, Phone, RosterGroup, VideoInputControl, VideoTileGrid, useContentShareControls, useMeetingManager, useRosterState } from "amazon-chime-sdk-component-library-react";
import { CopySVG } from "../assets/SVG";
import RosterAttendee from "./RosterAttendee";

const Meeting: FC = () => {
  const [areAttendeesShown, setAreAttendeesShown] = useState(true);
  const meetingManager = useMeetingManager();
  const { toggleContentShare } = useContentShareControls();
  const { roster } = useRosterState();
  const attendees = Object.values(roster);

  const clickedEndMeeting = async () => {
    const meetingId = meetingManager.meetingId;
    if (meetingId) {
      await meetingManager.leave();
    }
  };

  return (
    <main className={`flex h-[100dvh] w-full flex-col items-center justify-between`}>
      {/* @ts-ignore */}
      <VideoTileGrid layout="standard" className="h-full !bg-gray-900" />
      <button className="absolute top-5 right-5 text-[whitesmoke] focus:text-green-500" onClick={() => navigator.clipboard.writeText(window.location.href.toString())}>
        <CopySVG />
      </button>
      <ControlBar className="!relative !border-gray-800 !bg-gray-900" layout="bottom" showLabels>
        <AudioInputControl className="text-indigo-200" />
        <VideoInputControl />
        <ControlBarButton icon={<Share />} onClick={toggleContentShare} label="Share" />
        <AudioOutputControl />
        <div className="relative">
          <Badge className="absolute -top-2 right-2" value={attendees.length} />
          <ControlBarButton icon={<Attendees />} onClick={() => setAreAttendeesShown((prevState) => !prevState)} label="Attendees" />
        </div>

        <ControlBarButton icon={<Phone />} onClick={clickedEndMeeting} label="End" />
      </ControlBar>

      {areAttendeesShown && (
        // @ts-ignore
        <RosterGroup className="absolute top-4 right-2">
          {attendees.map(({ chimeAttendeeId, name }) => (
            <RosterAttendee key={chimeAttendeeId} attendeeId={chimeAttendeeId} attendeeName={name} />
          ))}
        </RosterGroup>
      )}
    </main>
  );
};

export default Meeting;
