import React from "react";
import { Link } from "react-router-dom";

interface RootProps {}

const Root: React.FC<RootProps> = () => {
  return (
    <main>
      <h1>hi, you are logged in</h1>
      <Link to="/meeting">Go To Meeting</Link>
    </main>
  );
};

export default Root;
