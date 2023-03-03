import type { AWS, AwsArn } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
  service: "vidvely-server",
  frameworkVersion: "3",
  plugins: [
    "serverless-esbuild", //
    "serverless-offline",
  ],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
  },

  layers: {
    Prisma: {
      name: "Prisma",
      path: "node_modules/@prisma/client",
    },
  },

  functions: {
    "vidvely-http-api": {
      handler: "src/server.handler",
      events: [{ httpApi: "*" }],
    },
    "vidvely-rest-api": {
      handler: "src/server.handler",
      events: [{ http: { path: "/{proxy+}", method: "any" } }],
    },
  },
};
module.exports = serverlessConfiguration;
