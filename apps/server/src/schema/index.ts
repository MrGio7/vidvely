import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs as scalarTypeDefs } from "graphql-scalars";

// types
import userType from "./user/user.type";

// Resolvers
import userResolver from "./user/user.resolver";

const schema = makeExecutableSchema({
  typeDefs: mergeTypeDefs([`type Query`, `type Mutation`, ...scalarTypeDefs, userType]),
  resolvers: mergeResolvers(userResolver),
});

export default schema;
