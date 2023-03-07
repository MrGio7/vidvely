import { CognitoJwtVerifier } from "aws-jwt-verify";
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context } from "aws-lambda";
import axios from "axios";
import { prisma } from "/opt/client";

interface AuthData {
  id_token: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

function response(input: APIGatewayProxyStructuredResultV2) {
  return {
    ...input,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST",
      "Access-Control-Allow-Credentials": "true",
      ...input.headers,
    },
  };
}

async function authCodeHandler(authCode: string) {
  const authData: AuthData | null = await axios
    .post(
      "https://vidvaley-dev.auth.eu-central-1.amazoncognito.com/oauth2/token",
      {
        grant_type: "authorization_code",
        client_id: "3cermrrihd00fn1742frogg4ip",
        code: authCode,
        redirect_uri: "http://localhost:5173/auth/",
      },
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    )
    .then((res) => res.data)
    .catch((error) => console.error(error));

  if (!authData) return response({ statusCode: 401 });

  const verifier = CognitoJwtVerifier.create({
    userPoolId: "eu-central-1_3JGV6ob34",
    tokenUse: "access",
    clientId: "3cermrrihd00fn1742frogg4ip",
  });

  const payload = await verifier.verify(authData.access_token);

  await prisma.user.upsert({
    where: { id: payload.sub },
    create: { id: payload.sub, userName: payload.username },
    update: {},
  });

  return response({
    statusCode: 200,
    body: "Bearer " + authData.access_token,
    cookies: [
      `access_token=${authData.access_token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60}`,
      `refresh_token=${authData.refresh_token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60 * 24 * 30}`,
    ],
  });
}

async function refreshTokenHandler(refresh_token: string) {
  const authData: { access_token: string } | null = await axios
    .post(
      "https://vidvaley-dev.auth.eu-central-1.amazoncognito.com/oauth2/token",
      {
        grant_type: "refresh_token",
        client_id: "3cermrrihd00fn1742frogg4ip",
        refresh_token,
      },
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    )
    .then((res) => res.data)
    .catch((error) => console.error(error));

  if (!authData?.access_token) return response({ statusCode: 401 });

  return response({ statusCode: 200, body: "Bearer " + authData.access_token, cookies: [`access_token=${authData.access_token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60}`] });
}

export const auth = async (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyStructuredResultV2> => {
  const refresh_token = event.cookies?.find((cookie) => cookie.startsWith("refresh_token"))?.substring(14);
  const authCode = event.body;

  if (!refresh_token && !authCode) return response({ statusCode: 401 });

  if (!!authCode) return authCodeHandler(authCode);

  if (!!refresh_token) return refreshTokenHandler(refresh_token);

  return response({ statusCode: 500 });
};
