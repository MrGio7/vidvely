import axios from "axios";
import React, { useEffect } from "react";
import Loader from "./loader";
import * as router from "react-router-dom";

interface AuthProps {}

const Auth: React.FC<AuthProps> = () => {
  const authCode = new URL(window.location.href).searchParams.get("code");

  useEffect(() => {
    axios
      .post(
        "http://localhost:4000/auth", //
        { code: authCode },
        { withCredentials: true }
      )
      .then(() => router.redirect("/"))
      .catch((error) => alert(error.message));
  }, []);

  return <Loader />;
};

export default Auth;
