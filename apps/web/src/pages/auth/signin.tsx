import type { GetServerSidePropsContext } from "next";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useReducer } from "react";
import { LoadingSVG } from "~/assets/SVG";
import { env } from "~/env.mjs";
import { getServerAuthSession } from "~/server/auth";

export default function SignIn() {
  const router = useRouter();
  const meetingId = router.query.meetingId;

  useEffect(() => {
    signIn("cognito", {
      callbackUrl: !!meetingId ? `/?meetingId=${meetingId}` : "/",
    });
  }, []);
  return <LoadingSVG />;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerAuthSession(context);

  if (session) {
    return { redirect: { destination: "/" } };
  }

  return {
    props: {},
  };
}
