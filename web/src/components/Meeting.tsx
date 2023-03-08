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
import { CopySVG } from "../assets/SVG";

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
    <div className="h-full w-full flex flex-col justify-between">
      <VideoTileGrid layout="standard" className="h-full !bg-gray-900" />
      <button className="focus:text-green-500 text-[whitesmoke] absolute top-5 left-5" onClick={() => navigator.clipboard.writeText(meetingManager.meetingId || "")}>
        <CopySVG />
      </button>
      <ControlBar className="!relative !bg-gray-900 !border-gray-800" layout="bottom" showLabels>
        <AudioInputControl className="text-indigo-200" />
        <VideoInputControl />
        <AudioOutputControl />
        <ControlBarButton icon={<Phone />} onClick={clickedEndMeeting} label="End" />
      </ControlBar>
    </div>
  );
};

export default Meeting;
