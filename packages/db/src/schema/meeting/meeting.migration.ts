import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { dynamo } from "../../client";

async function migrateMeeting() {
  const createTableCommand = new CreateTableCommand({
    TableName: "Meeting",
    AttributeDefinitions: [
      {
        AttributeName: "meetingId",
        AttributeType: "S",
      },
    ],
    KeySchema: [
      {
        AttributeName: "meetingId",
        KeyType: "HASH",
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
  });

  const table = await dynamo.send(createTableCommand);

  return table;
}

migrateMeeting();
