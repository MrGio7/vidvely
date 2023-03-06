import React, { FC } from "react";

import {
  AudioInputControl,
  AudioOutputControl,
  ControlBar,
  ControlBarButton,
  Phone,
  useMeetingManager,
  MeetingStatus,
  useMeetingStatus,
  VideoInputControl,
  VideoTileGrid,
} from "amazon-chime-sdk-component-library-react";
import { trpc, trpcProxy } from "../utils/trpc";

const Meeting: FC = () => {
  const meetingManager = useMeetingManager();
  const meetingStatus = useMeetingStatus();

  const clickedEndMeeting = async () => {
    const meetingId = meetingManager.meetingId;
    if (meetingId) {
      await trpcProxy.endMeeting.mutate({ meetingId });
      await meetingManager.leave();
    }
  };

  return (
    <div className="h-[calc(100%-5rem)] w-full flex flex-col justify-between">
      <VideoTileGrid layout="standard" className="h-full" />
      {meetingStatus === MeetingStatus.Succeeded ? (
        <ControlBar layout="bottom" showLabels>
          <AudioInputControl />
          <VideoInputControl />
          <AudioOutputControl />
          <ControlBarButton icon={<Phone />} onClick={clickedEndMeeting} label="End" />
        </ControlBar>
      ) : (
        <div />
      )}
    </div>
  );
};

export default Meeting;
