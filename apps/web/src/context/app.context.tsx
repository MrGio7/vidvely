import React, { createContext, useState } from "react";
import { User } from "~/types/user";
import { headers } from "next/headers";

type AppContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const AppContext = createContext<AppContextType>({
  user: null,
  setUser: () => null,
});

export const useAppContext = () => React.useContext(AppContext);

interface AppContextProviderProps {
  children: React.ReactNode;
}

const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
