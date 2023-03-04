import { ChimeClient, CreateMeetingCommand, CreateAttendeeCommand, DeleteMeetingCommand } from "@aws-sdk/client-chime";
import { v4 as uuidv4 } from "uuid";

interface CreateChimeMeetingInput {
  name: string;
  title: string;
}

interface JoinChimeMeetingInput {
  meetingId: string;
  name: string;
}

const chime = new ChimeClient({ region: process.env.AWS_REGION });

export const createChimeMeeting = async ({ name, title }: CreateChimeMeetingInput) => {
  const createMeetingCommand = new CreateMeetingCommand({
    ClientRequestToken: uuidv4(),
    ExternalMeetingId: title.substring(0, 64),
  });

  console.info("Creating new meeting");

  const meetingInfo = await chime.send(createMeetingCommand);

  console.info("Adding new attendee");

  const createAttendeeCommand = new CreateAttendeeCommand({
    MeetingId: meetingInfo.Meeting?.MeetingId,
    ExternalUserId: `${uuidv4()}#${name}`.substring(0, 64),
  });

  const attendeeInfo = await chime.send(createAttendeeCommand);

  return {
    Meeting: meetingInfo.Meeting,
    Attendee: attendeeInfo.Attendee,
  };
};

export const joinChimeMeeting = async ({ meetingId, name }: JoinChimeMeetingInput) => {
  console.info("Adding new attendee");

  const createAttendeeCommand = new CreateAttendeeCommand({
    MeetingId: meetingId,
    ExternalUserId: `${uuidv4()}#${name}`.substring(0, 64),
  });

  const attendeeInfo = await chime.send(createAttendeeCommand);

  return {
    Attendee: attendeeInfo.Attendee,
  };
};

export const endChimeMeeting = async (meetingId: string) => {
  const deleteMeetingCommand = new DeleteMeetingCommand({ MeetingId: meetingId });

  await chime.send(deleteMeetingCommand);

  console.info("Deleted Meeting: " + meetingId);

  return true;
};
