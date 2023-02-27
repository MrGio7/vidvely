import { prisma } from "../../../prisma";
import { Resolvers } from "../../generated/resolvers";

const userResolver: Resolvers = {
  Query: {
    userInfo: (_parent, _args, ctx) => {
      return ctx.user;
    },

    users: (_parent, _args, ctx) => {
      return [];
    },
  },
};

export default userResolver;
