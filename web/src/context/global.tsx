import React, { createContext, useReducer, useState } from "react";
import { User } from "src/graphql/generated";

interface GlobalContextType {
  user?: Partial<User>;
  setUser: React.Dispatch<React.SetStateAction<Partial<User> | undefined>>;
}

export const GlobalContext = createContext<GlobalContextType>({
  setUser: () => {},
});

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Partial<User>>();

  return (
    <GlobalContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
