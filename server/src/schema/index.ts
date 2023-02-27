import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs as scalarTypeDefs, resolvers as scalarResolvers } from "graphql-scalars";

// types
import userType from "./user/user.type";

// Resolvers
import userResolver from "./user/user.resolver";

const schema = makeExecutableSchema({
  typeDefs: [`type Query`, `type Mutation`, scalarTypeDefs, userType],
  resolvers: { ...userResolver },
});

export default schema;
