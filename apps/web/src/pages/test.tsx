import React, { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { trpcProxy, trpc } from "~/utils/trpc";

import UserMenu from "~/components/UserMenu";
import Meeting from "~/components/Meeting";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    props: {},
  };
};

interface TestProps {}

const Test: React.FC<TestProps> = () => {
  return (
    <>
      <Meeting />
      <UserMenu />
    </>
  );
};

export default Test;
