import {
  MeetingStatus,
  useMeetingStatus,
} from "amazon-chime-sdk-component-library-react";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  type NextPage,
} from "next";
import { getServerSession } from "next-auth";
import Head from "next/head";
import Link from "next/link";
import MeetingForm from "~/components/MeetingForm";
import Meeting from "~/components/Meeting";
import { trpcProxy } from "~/utils/trpc";
import { useSession } from "next-auth/react";
import { getServerAuthSession } from "~/server/auth";
import { useContext } from "react";
import { AppContext } from "./_app";

const Home: NextPage = () => {
  const { user } = useContext(AppContext);
  const meetingStatus = useMeetingStatus();

  return (
    <>
      <main className={`flex h-[100dvh] flex-col items-center justify-center`}>
        {meetingStatus !== MeetingStatus.Succeeded && <MeetingForm />}
        {meetingStatus === MeetingStatus.Succeeded && <Meeting />}
      </main>
    </>
  );
};

export default Home;
