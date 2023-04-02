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
    profile: "vidvely",
    timeout: 30,
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
      COGNITO_POOL_ID: "${env:COGNITO_POOL_ID}",
      COGNITO_CLIENT_ID: "${env:COGNITO_CLIENT_ID}",
      COGNITO_DOMAIN: "${env:COGNITO_DOMAIN}",
    },
  },

  plugins: [
    "serverless-esbuild", //
    "serverless-offline",
  ],

  useDotenv: true,

  custom: {
    "serverless-offline": {
      httpPort: 4000,
    },
  },

  functions: {
    trpc: {
      handler: "src/handlers/trpc.handler",
      events: [{ httpApi: "OPTIONS /{proxy+}" }, { httpApi: "*" }],
    },
  },
};

module.exports = serverlessConfiguration;
