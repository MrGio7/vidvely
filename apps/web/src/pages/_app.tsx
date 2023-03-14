import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

import {
  MeetingProvider,
  darkTheme,
} from "amazon-chime-sdk-component-library-react";
import { ThemeProvider } from "styled-components";
import "~/styles/globals.css";
import { trpc } from "~/utils/trpc";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ThemeProvider theme={darkTheme}>
        {/* @ts-ignore */}
        <MeetingProvider>
          <Component {...pageProps} />
        </MeetingProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default trpc("").withTRPC(MyApp);
