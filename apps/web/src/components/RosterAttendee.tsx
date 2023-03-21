import { RosterCell, useAttendeeStatus } from "amazon-chime-sdk-component-library-react";
import React from "react";

interface RosterAttendeeProps {
  attendeeId: string;
  attendeeName?: string;
}

const RosterAttendee: React.FC<RosterAttendeeProps> = ({ attendeeId, attendeeName = "Guest" }) => {
  const { muted, videoEnabled } = useAttendeeStatus(attendeeId);

  return <RosterCell key={attendeeId} name={attendeeName || "Guest"} muted={muted} videoEnabled={videoEnabled} />;
};

export default RosterAttendee;
