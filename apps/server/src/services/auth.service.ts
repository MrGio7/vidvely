import { TRPCError } from "@trpc/server";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import axios from "axios";
import { prisma } from "/opt/client";

interface AuthData {
  id_token: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export async function authCodeHandler(authCode: string) {
  const authData: AuthData | null = await axios
    .post(
      "https://vidvaley-dev.auth.eu-central-1.amazoncognito.com/oauth2/token",
      {
        grant_type: "authorization_code",
        client_id: "3cermrrihd00fn1742frogg4ip",
        code: authCode,
        redirect_uri: `${process.env.CLIENT_URL}`,
      },
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    )
    .then((res) => res.data)
    .catch((error) => console.error(error));

  if (!authData) throw new TRPCError({ code: "UNAUTHORIZED" });

  const verifier = CognitoJwtVerifier.create({
    userPoolId: "eu-central-1_3JGV6ob34",
    tokenUse: "id",
    clientId: "3cermrrihd00fn1742frogg4ip",
  });

  const payload = await verifier.verify(authData.id_token);

  await prisma.user.upsert({
    where: { id: payload.sub },
    create: { id: payload.sub, email: (payload.email as string) || undefined },
    update: { email: (payload.email as string) || undefined },
  });

  return {
    accessToken: authData.access_token,
    refreshToken: authData.refresh_token,
  };
}

export async function refreshTokenHandler(refresh_token: string) {
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

  if (!authData?.access_token) throw new TRPCError({ code: "UNAUTHORIZED" });

  return { accessToken: authData.access_token };
}
