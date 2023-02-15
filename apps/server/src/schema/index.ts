import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";

// types
import scalars from "./scalars";
import userType from "./user/user.type";

// Resolvers
import userResolver from "./user/user.resolver";

const schema = makeExecutableSchema({
  typeDefs: mergeTypeDefs([`type Query`, `type Mutation`, scalars, userType]),
  resolvers: mergeResolvers(userResolver),
});

export default schema;
