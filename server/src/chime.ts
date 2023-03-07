import { ChimeClient, CreateMeetingCommand, CreateAttendeeCommand, DeleteMeetingCommand } from "@aws-sdk/client-chime";
import { v4 as uuidv4 } from "uuid";

interface CreateChimeMeetingInput {
  name: string;
  title: string;
}

interface JoinChimeMeetingInput {
  meetingId: string;
  userId: string;
}

const chime = new ChimeClient({ region: "eu-central-1" });

export const createChimeMeeting = async () => {
  const createMeetingCommand = new CreateMeetingCommand({
    ClientRequestToken: uuidv4(),
    ExternalMeetingId: uuidv4(),
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

export const joinChimeMeeting = async ({ meetingId, userId }: JoinChimeMeetingInput) => {
  console.info("Adding new attendee");

  const createAttendeeCommand = new CreateAttendeeCommand({
    MeetingId: meetingId,
    ExternalUserId: userId,
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
};
