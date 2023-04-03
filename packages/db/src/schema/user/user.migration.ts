import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { dynamo } from "../../client";

async function migrateUser() {
  const createTableCommand = new CreateTableCommand({
    TableName: "User",
    AttributeDefinitions: [
      {
        AttributeName: "userId",
        AttributeType: "S",
      },
    ],
    KeySchema: [
      {
        AttributeName: "userId",
        KeyType: "HASH",
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
  });

  const table = await dynamo.send(createTableCommand);

  return table;
}

migrateUser();
