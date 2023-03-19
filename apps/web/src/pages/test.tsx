import React, { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { trpcProxy, trpc } from "~/utils/trpc";
import { env } from "~/env.mjs";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    props: {},
  };
};

interface TestProps {}

const Test: React.FC<TestProps> = () => {
  const [test, setTest] = useState("");
  console.log(env.NEXT_PUBLIC_TRPC_ORIGIN);

  useEffect(() => {
    if (typeof window !== "undefined") {
      trpcProxy.auth.greet.query().then((res) => console.log(res));
    }
  }, []);

  return <h1>Hello World</h1>;
};

export default Test;
