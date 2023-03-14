import { FC } from "react";

import {
  AudioInputControl,
  AudioOutputControl,
  ControlBar,
  ControlBarButton,
  Phone,
  VideoInputControl,
  VideoTileGrid,
  useMeetingManager,
} from "amazon-chime-sdk-component-library-react";
import { CopySVG } from "../assets/SVG";

const Meeting: FC = () => {
  const meetingManager = useMeetingManager();

  const clickedEndMeeting = async () => {
    const meetingId = meetingManager.meetingId;
    if (meetingId) {
      // await trpcProxy(session.data!.token).endMeeting.mutate({ meetingId });
      await meetingManager.leave();
    }
  };

  return (
    <div className="flex h-full w-full flex-col justify-between">
      <VideoTileGrid layout="standard" className="h-full !bg-gray-900" />
      <button
        className="absolute top-5 left-5 text-[whitesmoke] focus:text-green-500"
        onClick={() =>
          navigator.clipboard.writeText(window.location.href.toString())
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
