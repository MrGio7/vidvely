import { type Session } from "next-auth";
import { SessionProvider, signIn, useSession } from "next-auth/react";
import { type AppType } from "next/app";

import {
  MeetingProvider,
  darkTheme,
} from "amazon-chime-sdk-component-library-react";
import { useState } from "react";
import { ThemeProvider } from "styled-components";
import { LoadingSVG } from "~/assets/SVG";
import "~/styles/globals.css";
import { User } from "~/types/user";
import { trpc } from "~/utils/trpc";

const Auth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const session = useSession({
    required: true,
    onUnauthenticated: () => signIn("cognito"),
  });

  if (session.status === "loading") return <LoadingSVG />;

  return <>{children}</>;
};

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const [user, setUser] = useState<User>({} as User);

  return (
    <SessionProvider session={session}>
      <ThemeProvider theme={darkTheme}>
        {/* @ts-ignore */}
        <MeetingProvider>
          <Auth>
            <Component {...pageProps} />
          </Auth>
        </MeetingProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default trpc("").withTRPC(MyApp);
