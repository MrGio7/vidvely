import React, { ChangeEvent, FC, FormEvent, useContext, useState } from "react";

import {
  Flex,
  FormField,
  Input,
  PrimaryButton,
  useMeetingManager,
  useMeetingStatus,
} from "amazon-chime-sdk-component-library-react";
import { trpcProxy, trpc } from "../utils/trpc";
import { MeetingSessionConfiguration } from "amazon-chime-sdk-js";
import { ArrowSVG } from "../assets/SVG";
import { signIn, useSession } from "next-auth/react";

const MeetingForm: FC = () => {
  const meetingManager = useMeetingManager();
  const [meetingId, setMeetingId] = useState("");
  const [isMeetingIdInputHidden, setIsMeetingIdInputHidden] = useState(true);
  const session = useSession({
    required: true,
    onUnauthenticated: () => signIn("cognito"),
  });

  if (session.status === "loading") return <h1>loading...</h1>;
  if (session.status !== "authenticated") return <h1>unauthenticated</h1>;

  const token = session.data.token;

  function getAttendeeCallback() {
    return async (chimeAttendeeId: string, externalUserId?: string) => {
      const { firstName, lastName, email } = await trpcProxy(
        token
      ).findOrCreateUser.mutate({});

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

    const meeting = await trpcProxy(token).getMeeting.query({ meetingId });

    if (!meeting) return;

    try {
      const joinInfo = await trpcProxy(token).joinMeeting.mutate({
        meetingId: meeting.id,
      });

      const meetingSessionConfiguration = new MeetingSessionConfiguration(
        JSON.parse(meeting.data),
        joinInfo.Attendee
      );

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
      const joinInfo = await trpcProxy(token).createMeeting.mutate();

      const meetingSessionConfiguration = new MeetingSessionConfiguration(
        joinInfo.Meeting,
        joinInfo.Attendee
      );

      await meetingManager.join(meetingSessionConfiguration);
    } catch (error) {
      console.error(error);
    }

    await meetingManager.start();
  };

  function backButtonHandler(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    event.preventDefault();
    setIsMeetingIdInputHidden(true);
  }

  return (
    <form className="flex w-5/6 flex-col items-center gap-y-5">
      {!isMeetingIdInputHidden && (
        <>
          <button
            className="m-0 w-48 p-0 text-2xl font-bold text-indigo-700 hover:text-indigo-800"
            onClick={backButtonHandler}
          >
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

      <PrimaryButton
        className="w-48 !border-indigo-800 !bg-indigo-700 !text-slate-300 hover:!bg-indigo-800 focus:!border-indigo-600 focus:shadow-indigo-600"
        label="Join Meeting"
        onClick={joinMeetingHandler}
      />

      {isMeetingIdInputHidden && (
        <PrimaryButton
          className="w-48 !border-indigo-800 !bg-indigo-700 !text-slate-300 hover:!bg-indigo-800 focus:!border-indigo-800"
          label="Create Meeting"
          onClick={createMeetingHandler}
        />
      )}
    </form>
  );
};

export default MeetingForm;
