import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export class Dynamo extends DynamoDBClient {
  constructor() {
    super({ region: "eu-central-1" });
  }
}

export const dynamo = new Dynamo();
