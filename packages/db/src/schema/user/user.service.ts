import { AttributeValue, GetItemCommand, PutItemCommand, ScalarAttributeType, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { Dynamo } from "../../client";
import { CreateUserInput, UpdateUserInput } from "./user.type";

export class UserService extends Dynamo {
  tableName: string;

  constructor() {
    super();

    this.tableName = "User";
  }

  async create(createUserInput: CreateUserInput) {
    const { id, email, firstName, lastName } = createUserInput;
    const createUserCommand = new PutItemCommand({
      TableName: this.tableName,
      Item: {
        id: { S: id },
        createdAt: { S: new Date().toISOString() },
        updatedAt: { S: new Date().toISOString() },
        email: { S: email || "" },
        firstName: { S: firstName || "" },
        lastName: { S: lastName || "" },
      },
    });

    const user = await this.send(createUserCommand);

    return user;
  }

  async find(userId: string) {
    const getUserByIdCommand = new GetItemCommand({
      TableName: this.tableName,
      Key: { userId: { S: userId } },
    });

    const user = await this.send(getUserByIdCommand).then((data) => {
      if (!data.Item) return null;

      return {
        id: data.Item.userId.S!,
        email: data.Item.email.S!,
        firstName: data.Item.firstName.S!,
        lastName: data.Item.lastName.S!,
        createdAt: data.Item.createdAt.S!,
        updatedAt: data.Item.updatedAt.S!,
      };
    });

    return user;
  }

  async update(updateUserInput: UpdateUserInput) {
    const { id, email, firstName, lastName } = updateUserInput;
    const updateUserCommand = new UpdateItemCommand({
      TableName: this.tableName,
      Key: { userId: { S: id } },
      AttributeUpdates: {
        updatedAt: { Value: { S: new Date().toISOString() } },
        email: !!email ? { Value: { S: email } } : {},
        firstName: !!firstName ? { Value: { S: firstName } } : {},
        lastName: !!lastName ? { Value: { S: lastName } } : {},
      },
    });

    const user = await this.send(updateUserCommand);

    return user;
  }
}

export const userService = new UserService();
