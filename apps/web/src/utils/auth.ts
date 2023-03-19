import { GetServerSidePropsContext } from "next";
import { setAccessToken, trpcProxy } from "./trpc";
import nookies from "nookies";
import { env } from "~/env.mjs";

export async function authenticateUser(ctx: GetServerSidePropsContext) {
  const meetingId = ctx.query.meetingId as string | undefined;
  const code = ctx.query.code as string | undefined;
  const access_token = ctx.req.cookies.access_token;
  const refresh_token = ctx.req.cookies.refresh_token;

  if (!!access_token) {
    setAccessToken(access_token);
  } else if (!!refresh_token) {
    const { accessToken } = await trpcProxy.auth.refreshAccessToken.mutate(refresh_token);

    nookies.set(ctx, "access_token", accessToken, {
      path: "/",
      maxAge: 60 * 60,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    setAccessToken(accessToken);
  } else if (!!code) {
    const { accessToken, refreshToken } = await trpcProxy.auth.signIn.mutate(code);

    nookies.set(ctx, "access_token", accessToken, {
      path: "/",
      maxAge: 60 * 60,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    nookies.set(ctx, "refresh_token", refreshToken, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    setAccessToken(accessToken);
  } else {
    return {
      redirect: {
        destination: `${env.COGNITO_DOMAIN}/oauth2/authorize?client_id=${env.COGNITO_CLIENT_ID}&response_type=code&scope=email+openid+phone&redirect_uri=${env.NEXT_ORIGIN}${meetingId ? `/?meetingId=${meetingId}` : ""}`,
        permanent: false,
      },
    };
  }
}
