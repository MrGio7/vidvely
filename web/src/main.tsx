import ReactDOM from "react-dom";

import { MeetingProvider, lightTheme } from "amazon-chime-sdk-component-library-react";
import { ThemeProvider } from "styled-components";
import Meeting from "./components/Meeting";
import MeetingForm from "./components/MeetingForm";

import "./index.css";

ReactDOM.render(
  <ThemeProvider theme={lightTheme}>
    <MeetingProvider>
      <MeetingForm />
      <Meeting />
    </MeetingProvider>
  </ThemeProvider>,
  document.getElementById("root")
);
