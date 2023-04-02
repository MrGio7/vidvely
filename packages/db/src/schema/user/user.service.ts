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
        userId: { S: id },
        createdAt: { S: new Date().toISOString() },
        updatedAt: { S: new Date().toISOString() },
        email: { S: email || "" },
        firstName: { S: firstName || "" },
        lastName: { S: lastName || "" },
      },
    });

    await this.send(createUserCommand);

    return {
      id,
      email,
      firstName,
      lastName,
    };
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
      ReturnValues: "ALL_NEW",
    });

    const user = await this.send(updateUserCommand).then((data) => {
      if (!data.Attributes) throw new Error("User not found");

      return {
        id: data.Attributes.userId.S!,
        email: data.Attributes.email.S!,
        firstName: data.Attributes.firstName.S!,
        lastName: data.Attributes.lastName.S!,
        createdAt: data.Attributes.createdAt.S!,
        updatedAt: data.Attributes.updatedAt.S!,
      };
    });

    return user;
  }
}

export const userService = new UserService();
