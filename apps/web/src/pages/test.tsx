import React from "react";
import { GetServerSideProps } from "next";
import { trpcProxy } from "~/utils/trpc";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const ss = await trpcProxy.test.greet.query();
  debugger;
  return {
    props: {},
  };
};

interface TestProps {}

const Test: React.FC<TestProps> = () => {
  return <h1>Hello World</h1>;
};

export default Test;
