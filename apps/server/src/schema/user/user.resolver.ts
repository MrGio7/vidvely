import { Resolvers } from "../../generated/resolvers";

const userResolver: Resolvers = {
  Query: {
    users: (_parent, _args, ctx) => {
      return [];
    },
  },
};

export default userResolver;
