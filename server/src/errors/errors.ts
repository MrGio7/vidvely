import { GraphQLError } from "graphql";

export class UnauthorizedError extends GraphQLError {
  constructor() {
    super("Unauthorized", {
      extensions: { code: 401 },
    });
  }
}
