import * as dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
  service: "vidvely-server",
  frameworkVersion: "3",
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "eu-central-1",
    profile: "MrGio7",
    environment: {
      DATABASE_URL: process.env.DATABASE_URL!,
    },
  },

  plugins: [
    "serverless-esbuild", //
    "serverless-offline",
  ],

  custom: {
    esbuild: {
      external: ["/opt/client"],
    },
  },

  layers: {
    Prisma: {
      name: "Prisma",
      path: "./.layers/prisma",
    },
  },

  functions: {
    "vidvely-rest-api": {
      handler: "src/server.handler",
      events: [{ http: { path: "/{proxy+}", method: "any", cors: true } }],
      layers: [{ Ref: "PrismaLambdaLayer" }],
    },
  },
};
module.exports = serverlessConfiguration;