import React, { useEffect } from "react";
import { redirect } from "react-router-dom";

interface AuthProps {}

const Auth: React.FC<AuthProps> = () => {
  const authCode = new URL(window.location.href).searchParams.get("code");

  useEffect(() => {
    fetch("http://localhost:3000", {
      method: "POST",
      body: authCode,
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 401)
          window.location.replace(
            "https://vidvaley-dev.auth.eu-central-1.amazoncognito.com/oauth2/authorize?client_id=3cermrrihd00fn1742frogg4ip&response_type=code&scope=email+openid+phone&redirect_uri=http://localhost:5173/auth/"
          );

        if (res.status === 200) window.location.replace("http://localhost:5173");
      })
      .catch((error) => console.log(error));
  }, []);

  return <></>;
};

export default Auth;
