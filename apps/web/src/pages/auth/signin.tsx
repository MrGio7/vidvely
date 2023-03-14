import type { GetServerSidePropsContext } from "next";
import { signIn } from "next-auth/react";
import { useEffect } from "react";
import { LoadingSVG } from "~/assets/SVG";
import { env } from "~/env.mjs";
import { getServerAuthSession } from "~/server/auth";

export default function SignIn() {
  useEffect(() => {
    signIn("cognito");
  }, []);
  return <LoadingSVG />;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerAuthSession(context);
  const url = new URL(context.req.url!, env.NEXTAUTH_URL).searchParams.get(
    "callbackUrl"
  );

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: url } };
  }

  return {
    props: {},
  };
}
