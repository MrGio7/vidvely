import { Resolvers } from "../../generated/resolvers";

const userResolver: Resolvers = {
  Query: {
    users: () => [],
  },
};

export default userResolver;
