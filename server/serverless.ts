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
        allowedOrigins: ["https://vidvely.vercel.app", "http://localhost:5173"],
        allowedHeaders: ["authorization", "content-type"],
        allowedMethods: ["OPTIONS", "GET", "POST"],
        exposedResponseHeaders: ["*", "authorization"],
        maxAge: 3600,
      },
    },
    environment: {
      CLIENT_URL: process.env.CLIENT_URL!,
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
      events: [{ httpApi: "OPTIONS /" }, { httpApi: "POST /" }, { httpApi: "OPTIONS /logout" }, { httpApi: "POST /logout" }],
      layers: [{ Ref: "PrismaLambdaLayer" }],
    },
  },
};
module.exports = serverlessConfiguration;
