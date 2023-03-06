import React, { ChangeEvent, FC, FormEvent, useState } from "react";

import { Flex, FormField, Input, PrimaryButton, useMeetingManager } from "amazon-chime-sdk-component-library-react";
import { trpcProxy, trpc } from "../utils/trpc";
import { MeetingSessionConfiguration } from "amazon-chime-sdk-js";

const MeetingForm: FC = () => {
  const meetingManager = useMeetingManager();
  const [meetingTitle, setMeetingTitle] = useState("");
  const [attendeeName, setName] = useState("");

  function getAttendeeCallback() {
    return async (chimeAttendeeId: string, externalUserId?: string) => {
      const attendeeInfo = await trpcProxy.getUserFromDB.query({ userId: chimeAttendeeId });

      return {
        name: attendeeInfo?.firstName || "" + " " + attendeeInfo?.lastName || "",
      };
    };
  }

  const clickedJoinMeeting = async (event: FormEvent) => {
    event.preventDefault();

    meetingManager.getAttendee = getAttendeeCallback();
    const title = meetingTitle.trim().toLocaleLowerCase();
    const name = attendeeName.trim();

    const meeting = await trpcProxy.getMeetingFromDB.query({ title });

    debugger;
    try {
      if (!!meeting) {
        const joinInfo = await trpcProxy.joinMeeting.mutate({ meetingId: meeting.id, name });

        await trpcProxy.addUserToDB.mutate({ id: joinInfo.Attendee?.AttendeeId!, name });

        const meetingSessionConfiguration = new MeetingSessionConfiguration(JSON.parse(meeting.data!), joinInfo.Attendee);

        await meetingManager.join(meetingSessionConfiguration);
      } else {
        const joinInfo = await trpcProxy.createMeeting.mutate({ title, name });

        await trpcProxy.addMeetingToDB.mutate({ title, id: joinInfo?.Meeting?.MeetingId!, data: JSON.stringify(joinInfo.Meeting) });
        await trpcProxy.addUserToDB.mutate({ id: joinInfo.Attendee?.AttendeeId!, name });

        const meetingSessionConfiguration = new MeetingSessionConfiguration(joinInfo.Meeting, joinInfo.Attendee);

        await meetingManager.join(meetingSessionConfiguration);
      }
    } catch (error) {
      console.log(error);
    }

    // At this point you can let users setup their devices, or start the session immediately
    await meetingManager.start();
  };

  return (
    <form>
      <FormField
        field={Input}
        label="Meeting Id"
        value={meetingTitle}
        fieldProps={{
          name: "Meeting Id",
          placeholder: "Enter a Meeting ID",
        }}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setMeetingTitle(e.target.value);
        }}
      />
      <FormField
        field={Input}
        label="Name"
        value={attendeeName}
        fieldProps={{
          name: "Name",
          placeholder: "Enter your Attendee Name",
        }}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setName(e.target.value);
        }}
      />
      <Flex container layout="fill-space-centered" style={{ marginTop: "2.5rem" }}>
        <PrimaryButton label="Join Meeting" onClick={clickedJoinMeeting} />
      </Flex>
    </form>
  );
};

export default MeetingForm;
