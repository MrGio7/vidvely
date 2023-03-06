import ReactDOM from "react-dom";

import { MeetingProvider, lightTheme } from "amazon-chime-sdk-component-library-react";
import { ThemeProvider } from "styled-components";
import Meeting from "./components/Meeting";
import MeetingForm from "./components/MeetingForm";

import "./index.css";
import { App } from "./App";

ReactDOM.render(
  <ThemeProvider theme={lightTheme}>
    <MeetingProvider>
      <App />
    </MeetingProvider>
  </ThemeProvider>,
  document.getElementById("root")
);
