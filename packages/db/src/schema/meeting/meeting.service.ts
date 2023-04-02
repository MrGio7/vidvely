import { AttributeValue, GetItemCommand, PutItemCommand, ScalarAttributeType, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { Dynamo } from "../../client";
import { CreateMeetingInput, UpdateMeetingInput } from "./meeting.type";

export class MeetingService extends Dynamo {
  tableName: string;

  constructor() {
    super();

    this.tableName = "Meeting";
  }

  async create(createMeetingInput: CreateMeetingInput) {
    const { id, data, userId } = createMeetingInput;
    const createUserCommand = new PutItemCommand({
      TableName: this.tableName,
      Item: {
        meetingId: { S: id },
        createdAt: { S: new Date().toISOString() },
        updatedAt: { S: new Date().toISOString() },
        data: { S: data },
        users: { SS: [userId] },
      },
    });

    await this.send(createUserCommand);

    return {
      id,
      data,
      users: [userId],
    };
  }

  async find(meetingId: string) {
    const getMeetingByIdCommand = new GetItemCommand({
      TableName: this.tableName,
      Key: { meetingId: { S: meetingId } },
    });

    const meeting = await this.send(getMeetingByIdCommand).then((data) => {
      if (!data.Item) throw new Error("Meeting not found");

      return {
        id: data.Item.meetingId?.S!,
        data: data.Item.data?.S!,
        users: data.Item.users?.SS!,
        createdAt: data.Item.createdAt?.S!,
        updatedAt: data.Item.updatedAt?.S!,
      };
    });

    return meeting;
  }

  async update(updateMeetingInput: UpdateMeetingInput) {
    const { id, data, userId } = updateMeetingInput;

    const currentMeeting = await this.find(id);

    const updateMeetingCommand = new UpdateItemCommand({
      TableName: this.tableName,
      Key: { meetingId: { S: id } },
      AttributeUpdates: {
        updatedAt: { Value: { S: new Date().toISOString() } },
        data: !!data ? { Value: { S: data } } : {},
        users: !!userId ? { Value: { SS: [...currentMeeting.users, userId] } } : {},
      },
      ReturnValues: "ALL_NEW",
    });

    const meeting = await this.send(updateMeetingCommand).then((data) => {
      if (!data.Attributes) throw new Error("Meeting not found");

      return {
        id: data.Attributes.meetingId?.S!,
        data: data.Attributes.data?.S!,
        users: data.Attributes.users?.SS!,
        createdAt: data.Attributes.createdAt?.S!,
        updatedAt: data.Attributes.updatedAt?.S!,
      };
    });

    return meeting;
  }
}

export const meetingService = new MeetingService();
