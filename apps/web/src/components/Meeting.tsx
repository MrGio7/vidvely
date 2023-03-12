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
import { useSession } from "next-auth/react";

const Meeting: FC = () => {
  const meetingManager = useMeetingManager();
  const meetingStatus = useMeetingStatus();
  const session = useSession();

  if (session.status === "loading") return <h1>loading...</h1>;
  if (session.status !== "authenticated") return <h1>unauthenticated</h1>;

  const clickedEndMeeting = async () => {
    const meetingId = meetingManager.meetingId;
    if (meetingId) {
      await trpcProxy(session.data.token).endMeeting.mutate({ meetingId });
      await meetingManager.leave();
    }
  };

  return (
    <div className="flex h-full w-full flex-col justify-between">
      <VideoTileGrid layout="standard" className="h-full !bg-gray-900" />
      <button
        className="absolute top-5 left-5 text-[whitesmoke] focus:text-green-500"
        onClick={() =>
          navigator.clipboard.writeText(meetingManager.meetingId || "")
        }
      >
        <CopySVG />
      </button>
      <ControlBar
        className="!relative !border-gray-800 !bg-gray-900"
        layout="bottom"
        showLabels
      >
        <AudioInputControl className="text-indigo-200" />
        <VideoInputControl />
        <AudioOutputControl />
        <ControlBarButton
          icon={<Phone />}
          onClick={clickedEndMeeting}
          label="End"
        />
      </ControlBar>
    </div>
  );
};

export default Meeting;
