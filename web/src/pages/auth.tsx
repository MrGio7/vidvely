import React, { useContext, useEffect } from "react";
import { AppContext } from "../App";
import { trpc } from "../utils/trpc";

interface AuthProps {}

const Auth: React.FC<AuthProps> = () => {
  const authCode = new URL(window.location.href).searchParams.get("code");
  const { user, setUser } = useContext(AppContext);

  trpc.userInfo.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      setUser({
        id: data.id,
        email: data.email,
      });
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        fetch(import.meta.env.VITE_API_URL, {
          method: "POST",
          body: authCode,
          credentials: "include",
        })
          .then((res) => {
            if (res.status === 401)
              window.location.replace(
                `https://vidvaley-dev.auth.eu-central-1.amazoncognito.com/oauth2/authorize?client_id=3cermrrihd00fn1742frogg4ip&response_type=code&scope=email+openid+phone&redirect_uri=${
                  new URL(import.meta.url).origin
                }`
              );

            if (res.status === 200) {
              window.location.replace(new URL(import.meta.url).origin);
            }

            console.log(res);
          })
          .catch((error) => console.log(error));
      }
    },
  });

  return <></>;
};

export default Auth;
