import { type AppType } from "next/app";

import { MeetingProvider, darkTheme } from "amazon-chime-sdk-component-library-react";
import { ThemeProvider } from "styled-components";
import "~/styles/globals.css";
import { trpc } from "~/utils/trpc";

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
  return (
    <ThemeProvider theme={darkTheme}>
      {/* @ts-ignore */}
      <MeetingProvider>
        <Component {...pageProps} />
      </MeetingProvider>
    </ThemeProvider>
  );
};

export default trpc.withTRPC(MyApp);
