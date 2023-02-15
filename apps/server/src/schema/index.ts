import path from "path";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";

const typesArray = loadFilesSync(path.join(__dirname, "."), { recursive: true, extensions: ["graphql"] });
const resolversArray = loadFilesSync(path.join(__dirname, "./**/*.resolver.*"));

const schema = makeExecutableSchema({
  typeDefs: mergeTypeDefs([`type Query`, `type Mutation`, ...typesArray]),
  resolvers: mergeResolvers(resolversArray),
});

export default schema;
