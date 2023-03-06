import ReactDOM from "react-dom";

import { MeetingProvider, lightTheme } from "amazon-chime-sdk-component-library-react";
import { ThemeProvider } from "styled-components";
import { App } from "./App";

import "./index.css";

ReactDOM.render(
  <ThemeProvider theme={lightTheme}>
    <MeetingProvider>
      <App />
    </MeetingProvider>
  </ThemeProvider>,
  document.getElementById("root")
);
