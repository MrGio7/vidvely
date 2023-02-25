import { useEffect, useState } from "react";
import { Credentials, confirmVerificationCode, signUp, userPool } from "./utils/cognito";

import "./App.css";
import { AuthenticationDetails, CognitoUser, CookieStorage } from "amazon-cognito-identity-js";
import axios from "axios";

function App() {
  function signUpHandler(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();

    const formData = new FormData(ev.currentTarget);

    const credentials: Credentials & { code: string } = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      code: formData.get("code") as string,
    };

    signUp(credentials);
    confirmVerificationCode({ code: credentials.code, user: credentials.email });
  }

  function signInHandler(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const formData = new FormData(ev.currentTarget);

    const credentials: Credentials = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const cognitoUser = new CognitoUser({
      Pool: userPool,
      Username: credentials.email,
      Storage: new CookieStorage({ domain: "localhost" }),
    });

    const authenticationDetails = new AuthenticationDetails({ Username: credentials.email, Password: credentials.password });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        console.log("success login");
      },

      onFailure: function (err) {
        alert(err.message || JSON.stringify(err));
      },
    });
  }

  return (
    <div className="App">
      {/* <form onSubmit={signUpHandler}>
        <input type="email" name="email" id="email" required />
        <input type="password" name="password" id="password" required />
        <input type="text" name="code" id="code" />
        <button type="submit">Submit</button>
      </form> */}

      <form onSubmit={signInHandler}>
        <input type="email" name="email" id="email" required />
        <input type="password" name="password" id="password" required />
        <button type="submit">Submit</button>
      </form>

      <button
        onClick={() => {
          const authCode = new URL(window.location.href).searchParams.get("code");

          axios
            .post(
              "http://localhost:4000/auth",
              {
                code: authCode,
              },
              { withCredentials: true }
            )
            .then((res) => console.log(res));
        }}
      >
        FETCH AXIOS
      </button>
    </div>
  );
}

export default App;
