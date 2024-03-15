// UserContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { jwtDecode } from "jwt-decode";

interface UserContextProps {
  userId: string | null;
  basketId: string | null;
  favoriteId: string | null;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserContextProps>({
    userId: null,
    basketId: null,
    favoriteId: null,
  });

  useEffect(() => {
    // Retrieve access token from local storage (or wherever it's stored)
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      try {
        // Decode the access token
        const decodedToken: { [key: string]: any } = jwtDecode(accessToken);
        // Extract user-related data from the decoded token
        const { userId, basketID, favorite_productID } = decodedToken;

        // Update the user context with the extracted data
        setUserData({
          userId: userId,
          basketId: basketID, // Ensure consistency with the interface property name
          favoriteId: favorite_productID, // Ensure consistency with the interface property name
        });
        console.log('decode', decodedToken);
        console.log("UserData", userData);
      } catch (error) {
        console.error("Error decoding access token:", error);
      }
    }
  }, []);

  return (
    <UserContext.Provider value={userData}>{children}</UserContext.Provider>
  );
};

const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export { UserProvider, useUser };
