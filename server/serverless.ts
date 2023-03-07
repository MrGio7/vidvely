import * as dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
  service: "vidvely",
  frameworkVersion: "3",
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "eu-central-1",
    profile: "MrGio7",
    httpApi: {
      cors: true,
    },
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
      external: process.env.NODE_ENV !== "local" ? ["/opt/client"] : [],
    },
  },

  layers: {
    Prisma: {
      name: "Prisma",
      path: "./.layers/prisma",
    },
  },

  functions: {
    trpc: {
      handler: "src/handlers.trpc",
      events: [{ httpApi: "OPTIONS /{proxy+}" }, { httpApi: "*" }],
      layers: [{ Ref: "PrismaLambdaLayer" }],
    },
    auth: {
      handler: "src/handlers.auth",
      events: [{ httpApi: "OPTIONS /" }, { httpApi: "POST /" }],
      layers: [{ Ref: "PrismaLambdaLayer" }],
    },
  },
};
module.exports = serverlessConfiguration;
