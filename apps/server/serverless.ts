import * as dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
  service: "vidvely",
  frameworkVersion: "3",
  provider: {
    name: "aws",
    runtime: "nodejs16.x",
    region: "eu-central-1",
    profile: "MrGio7",
    httpApi: {
      cors: {
        allowCredentials: true,
        allowedOrigins: ["https://vidvely.vercel.app", "http://localhost:3000"],
        allowedHeaders: ["authorization", "content-type"],
        allowedMethods: ["OPTIONS", "GET", "POST"],
        exposedResponseHeaders: ["*", "authorization"],
        maxAge: 3600,
      },
    },
    environment: {
      DATABASE_URL: "${env:DATABASE_URL}",
    },
  },

  plugins: [
    "serverless-esbuild", //
    "serverless-offline",
  ],

  useDotenv: true,

  custom: {
    esbuild: {
      external: process.env.NODE_ENV !== "local" ? ["/opt/client"] : [],
    },
    "serverless-offline": {
      httpPort: 4000,
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
  },
};
module.exports = serverlessConfiguration;
