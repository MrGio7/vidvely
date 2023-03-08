import React, { ChangeEvent, FC, FormEvent, useContext, useState } from "react";

import { Flex, FormField, Input, PrimaryButton, useMeetingManager, useMeetingStatus } from "amazon-chime-sdk-component-library-react";
import { trpcProxy, trpc } from "../utils/trpc";
import { MeetingSessionConfiguration } from "amazon-chime-sdk-js";
import { redirect } from "react-router-dom";
import { AppContext } from "../App";
import { ArrowSVG } from "../assets/SVG";

const MeetingForm: FC = () => {
  const meetingManager = useMeetingManager();
  const [meetingId, setMeetingId] = useState("");
  const [isMeetingIdInputHidden, setIsMeetingIdInputHidden] = useState(true);

  function getAttendeeCallback() {
    return async (chimeAttendeeId: string, externalUserId?: string) => {
      const { firstName, lastName, email } = await trpcProxy.userInfo.query();

      return {
        name: firstName ? firstName + " " + lastName : email,
      };
    };
  }

  const joinMeetingHandler = async (event: FormEvent) => {
    event.preventDefault();

    if (!!isMeetingIdInputHidden) {
      setIsMeetingIdInputHidden(false);

      return;
    }

    meetingManager.getAttendee = getAttendeeCallback();

    const meeting = await trpcProxy.getMeeting.query({ meetingId });

    if (!meeting) return;

    try {
      const joinInfo = await trpcProxy.joinMeeting.mutate({ meetingId: meeting.id });

      const meetingSessionConfiguration = new MeetingSessionConfiguration(JSON.parse(meeting.data), joinInfo.Attendee);

      await meetingManager.join(meetingSessionConfiguration);
    } catch (error) {
      console.log(error);
    }

    // At this point you can let users setup their devices, or start the session immediately
    await meetingManager.start();
  };

  const createMeetingHandler = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const joinInfo = await trpcProxy.createMeeting.mutate();

      const meetingSessionConfiguration = new MeetingSessionConfiguration(joinInfo.Meeting, joinInfo.Attendee);

      await meetingManager.join(meetingSessionConfiguration);
    } catch (error) {
      console.error(error);
    }

    await meetingManager.start();
  };

  function backButtonHandler(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.preventDefault();
    setIsMeetingIdInputHidden(true);
  }

  return (
    <form className="w-5/6 flex flex-col items-center gap-y-5">
      {!isMeetingIdInputHidden && (
        <>
          <button className="w-48 m-0 p-0 text-2xl text-indigo-700 hover:text-indigo-800 font-bold" onClick={backButtonHandler}>
            <ArrowSVG className="h-8 w-8" />
          </button>
          <FormField
            field={Input}
            label=""
            value={meetingId}
            fieldProps={{
              name: "Meeting Id",
              placeholder: "Enter a Meeting ID",
            }}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setMeetingId(e.target.value);
            }}
            className="!mb-0"
            layout="input-only"
          />
        </>
      )}

      <PrimaryButton className="w-48 !bg-indigo-700 !border-indigo-800 hover:!bg-indigo-800" label="Join Meeting" onClick={joinMeetingHandler} />

      {isMeetingIdInputHidden && <PrimaryButton className="w-48 !bg-indigo-700 !border-indigo-800 hover:!bg-indigo-800" label="Create Meeting" onClick={createMeetingHandler} />}
    </form>
  );
};

export default MeetingForm;
