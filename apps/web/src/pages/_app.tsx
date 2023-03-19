import { type AppType } from "next/app";

import { MeetingProvider, darkTheme } from "amazon-chime-sdk-component-library-react";
import { ThemeProvider } from "styled-components";
import "~/styles/globals.css";
import { trpc } from "~/utils/trpc";
import ErrorBoundary from "~/components/ErrorBoundary";

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={darkTheme}>
        {/* @ts-ignore */}
        <MeetingProvider>
          <Component {...pageProps} />
        </MeetingProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default trpc.withTRPC(MyApp);
