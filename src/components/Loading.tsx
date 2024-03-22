import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const Loading = () => {
  const navigate = useNavigate();
  const [userLineData, setUserLineData] = useState({
    userLineId: null,
    userLineName: null,
  });
  const [accessToken, setAccessToken] = useState(null);
  const [basketCreated, setBasketCreated] = useState(false);
  const [favoriteProductCreated, setFavoriteProductCreated] = useState(false);

  useEffect(() => {
    // Retrieve userData from localStorage
    const userDataString = localStorage.getItem("userLineData");

    // Parse the userData JSON string to extract userId and displayName
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      setUserLineData(userData);

      // Make a request to check if the user exists on the server
      const checkUserExists = async () => {
        try {
          const response = await fetch(
            `https://order-api-patiparnpa.vercel.app/users/check/${userData.userLineId}`
          );
          if (response.ok) {
            const data = await response.json();
            // Check if the response contains data
            if (data._id) {
              // User exists, now request access token
              const accessTokenResponse = await fetch(
                "https://order-api-patiparnpa.vercel.app/auth/login",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ lineID: userData.userLineId }),
                }
              );
              if (accessTokenResponse.ok) {
                const accessTokenData = await accessTokenResponse.json();
                setAccessToken(accessTokenData.accessToken);
                // Save access token in local storage
                localStorage.setItem(
                  "accessToken",
                  accessTokenData.accessToken
                );
                navigate("/");
              } else {
                throw new Error("Failed to fetch access token");
              }
            } else {
              // User does not exist, create the user
              const createUserResponse = await fetch(
                "https://order-api-patiparnpa.vercel.app/users/create",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    lineID: userData.userLineId,
                    name: userData.userLineName,
                    basketID: "",
                    favorite_productID: "",
                  }),
                }
              );
              if (createUserResponse.ok) {
                const createdUserData = await createUserResponse.json();
                const userId = createdUserData._id; // Retrieve the user ID (_id) from the response

                // Now you can use userId to create the basket
                const createBasketResponse = await fetch(
                  "https://order-api-patiparnpa.vercel.app/baskets/create",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      userID: userId,
                    }),
                  }
                );

                if (createBasketResponse.ok) {
                  const createdBasketData = await createBasketResponse.json();
                  const createdBasketId = createdBasketData._id; // Retrieve the basket ID (_id) from the response
                  setBasketCreated(true);

                  // Create user favorite product using userId
                  const createFavoriteProductResponse = await fetch(
                    "https://order-api-patiparnpa.vercel.app/favorite_products/create",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        userID: userId,
                      }),
                    }
                  );

                  if (createFavoriteProductResponse.ok) {
                    const createdFavoriteProductData =
                      await createFavoriteProductResponse.json();
                    const createdFavoriteProductId =
                      createdFavoriteProductData._id; // Retrieve the favorite product ID (_id) from the response
                    setFavoriteProductCreated(true);

                    // Update user data with the created favorite product ID
                    const updateUserResponse = await fetch(
                      `https://order-api-patiparnpa.vercel.app/users/${userId}`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          favorite_productID: createdFavoriteProductId, // Update with the created favorite product ID
                          basketID: createdBasketId,
                        }),
                      }
                    );

                    if (updateUserResponse.ok) {
                      checkUserExists(); // User data updated successfully
                    } else {
                      throw new Error("Failed to update user data");
                    }
                  } else {
                    throw new Error("Failed to create favorite product");
                  }
                } else {
                  throw new Error("Failed to create basket");
                }
              } else {
                throw new Error("Failed to create user");
              }
            }
          } else {
            throw new Error("Failed to fetch user existence");
          }
        } catch (error) {
          console.error("Error checking user existence:", error);
        }
      };

      checkUserExists();
    }
  }, []); // Empty dependency array ensures useEffect runs only once on component mount

  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <div>loading...</div>
      <div>User ID: {userLineData?.userLineId}</div>
      <div>User Name: {userLineData?.userLineName}</div>
    </div>
  );
};
