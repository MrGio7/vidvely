import { TRPCError } from "@trpc/server";
import { db } from "@vidvely/db";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import axios from "axios";

interface AuthData {
  id_token: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface AuthCodeHandlerInput {
  authCode: string;
  redirectUrl: string;
}

export async function authCodeHandler({ authCode, redirectUrl }: AuthCodeHandlerInput) {
  const authData: AuthData | null = await axios
    .post(
      `${process.env.COGNITO_DOMAIN}/oauth2/token`,
      {
        grant_type: "authorization_code",
        client_id: process.env.COGNITO_CLIENT_ID,
        code: authCode,
        redirect_uri: redirectUrl,
      },
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    )
    .then((res) => res.data)
    .catch((error) => console.error(error));

  if (!authData) throw new TRPCError({ code: "UNAUTHORIZED" });

  const verifier = CognitoJwtVerifier.create({
    tokenUse: "id",
    userPoolId: process.env.COGNITO_POOL_ID!,
    clientId: process.env.COGNITO_CLIENT_ID!,
  });

  const payload = await verifier.verify(authData.id_token);

  if (!!payload.sub) {
    const user = await db.user.find(payload.sub);

    if (!user)
      await db.user.create({
        id: payload.sub,
        email: payload.email?.toString() || "",
      });
  }

  return {
    accessToken: authData.access_token,
    refreshToken: authData.refresh_token,
  };
}

export async function refreshTokenHandler(refresh_token: string) {
  const authData: { access_token: string } | null = await axios
    .post(
      `${process.env.COGNITO_DOMAIN}/oauth2/token`,
      {
        grant_type: "refresh_token",
        client_id: process.env.COGNITO_CLIENT_ID!,
        refresh_token,
      },
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    )
    .then((res) => res.data)
    .catch((error) => console.error(error));

  if (!authData?.access_token) throw new TRPCError({ code: "UNAUTHORIZED" });

  return { accessToken: authData.access_token };
}
