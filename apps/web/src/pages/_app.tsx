import { type Session } from "next-auth";
import { SessionProvider, signIn, useSession } from "next-auth/react";
import { type AppType } from "next/app";

import {
  MeetingProvider,
  darkTheme,
} from "amazon-chime-sdk-component-library-react";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { ThemeProvider } from "styled-components";
import { LoadingSVG } from "~/assets/SVG";
import "~/styles/globals.css";
import { trpc } from "~/utils/trpc";

interface AppContext {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
}

export const AppContext = createContext<AppContext>({
  user: {} as User,
  setUser: () => {},
});

const Auth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setUser } = useContext(AppContext);
  const session = useSession({
    required: true,
    onUnauthenticated: () => signIn("cognito"),
  });

  const user = session.data?.user;

  useEffect(() => {
    if (!!user) setUser(user);
  }, [user]);

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
          <AppContext.Provider value={{ user, setUser }}>
            <Auth>
              <Component {...pageProps} />
            </Auth>
          </AppContext.Provider>
        </MeetingProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default trpc("").withTRPC(MyApp);
