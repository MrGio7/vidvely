import middy from "@middy/core";
import cors from "@middy/http-cors";
import { awsLambdaRequestHandler } from "@trpc/server/adapters/aws-lambda";
import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";
import { createContext } from "src";
import { appRouter } from "src/router";

const setOptionsResMiddleware = (): middy.MiddlewareObj<APIGatewayProxyEventV2, APIGatewayProxyResult> => {
  const before: middy.MiddlewareFn<APIGatewayProxyEventV2, APIGatewayProxyResult> = async (request): Promise<void> => {
    // Your middleware logic
  };

  const after: middy.MiddlewareFn<APIGatewayProxyEventV2, APIGatewayProxyResult> = async (request): Promise<APIGatewayProxyResult | void> => {
    if (request.event.requestContext.http.method === "OPTIONS")
      return {
        statusCode: 200,
        body: "",
      };
  };

  return {
    before,
    after,
  };
};

export const handler = middy()
  .handler(
    awsLambdaRequestHandler({
      router: appRouter,
      createContext,
      responseMeta({ ctx, paths, type, errors }) {
        // checking that no procedures errored
        const allOk = errors.length === 0;
        // checking we're doing a query request
        const isQuery = type === "query";
        if (allOk && isQuery) {
          // cache request for 1 day + revalidate once every second
          const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
          return {
            headers: {
              "cache-control": `s-maxage=1, stale-while-revalidate=${ONE_DAY_IN_SECONDS}`,
            },
          };
        }
        return {};
      },
    })
  )
  .use(setOptionsResMiddleware())
  .use(
    cors({
      credentials: true,
      headers: "Authorization,Content-Type,x-amz-date,x-api-key,x-amz-security-token,x-amz-user-agent,x-amzn-trace-id",
      methods: "OPTIONS,POST,GET",
      origins: ["https://vidvely.vercel.app", "http://localhost:3000"],
    })
  );
