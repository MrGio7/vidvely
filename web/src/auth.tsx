import axios from "axios";
import React, { useContext, useEffect } from "react";
import * as router from "react-router-dom";
import { GlobalContext } from "./context";

interface AuthProps {}

const Auth: React.FC<AuthProps> = () => {
  const authCode = new URL(window.location.href).searchParams.get("code");
  const { user, setUser } = useContext(GlobalContext);

  useEffect(() => {
    if (!authCode && !user)
      window.location.replace(
        "https://vidvaley-dev.auth.eu-central-1.amazoncognito.com/oauth2/authorize?client_id=3cermrrihd00fn1742frogg4ip&response_type=code&scope=email+openid+phone&redirect_uri=http://localhost:5173/auth/"
      );

    if (!!authCode)
      axios
        .post(
          "http://localhost:4000/auth", //
          { code: authCode },
          { withCredentials: true }
        )
        .then(() => router.redirect("/"))
        .catch((error) => console.log(error));
  }, []);

  return <></>;
};

export default Auth;
