import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import liff from "@line/liff"; // Import LIFF library

export const Loading = () => {
  const navigate = useNavigate();
  const [userLineData, setUserLineData] = useState({
    userLineId: null,
    userLineName: null,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const userDataString = localStorage.getItem("userLineData");
      console.log("userdatastring", userDataString);
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserLineData(userData);

        try {
          const response = await fetch(`https://order-api-patiparnpa.vercel.app/users/check/${userData.userLineId}`);
          if (response.ok) {
            console.log("User is found");
            
            // Grant access token to the user
            const accessTokenResponse = await fetch("https://order-api-patiparnpa.vercel.app/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ lineID: userData.userLineId }),
            });

            if (accessTokenResponse.ok) {
              try {
                const accessTokenData = await accessTokenResponse.json();

                await localStorage.setItem("accessToken", accessTokenData.access_token);

            

                console.log('accessTokenData:', accessTokenData);
                
                // Check if access token is stored properly
                console.log('Stored access token:', localStorage.getItem("accessToken"));
            
                // Delay the navigation until after the access token is saved
                //navigate("/");
              } catch (error) {
                console.error('Error saving access token:', error);
              }
            } else {
              throw new Error("Failed to fetch access token");
            }
          } else if (response.status === 404) {
            console.log("User is not found");

            // Create the user if not found
            const createUserResponse = await fetch("https://order-api-patiparnpa.vercel.app/users/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                lineID: userData.userLineId,
                name: userData.userLineName,
                basketID: "",
                favorite_productID: "",
                status:"open"
              }),
            });

            if (createUserResponse.ok) {
              const createdUserData = await createUserResponse.json();
              const userId = createdUserData._id;

              // Create basket for the user
              const createBasketResponse = await fetch("https://order-api-patiparnpa.vercel.app/baskets/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userID: userId, items: {} }),
              });

              if (createBasketResponse.ok) {
                // Create favorite product for the user
                const createFavoriteProductResponse = await fetch("https://order-api-patiparnpa.vercel.app/favorite_products/create", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ userID: userId }),
                });

                if (createFavoriteProductResponse.ok) {
                  // Update user data with basket and favorite product IDs
                  const createdBasketData = await createBasketResponse.json();
                  const createdFavoriteProductData = await createFavoriteProductResponse.json();

                  const updateUserResponse = await fetch(`https://order-api-patiparnpa.vercel.app/users/${userId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      favorite_productID: createdFavoriteProductData._id,
                      basketID: createdBasketData._id,
                    }),
                  });

                  if (updateUserResponse.ok) {
                    console.log("User data updated successfully");

                    // Grant access token to the user
                    const accessTokenResponse = await fetch("https://order-api-patiparnpa.vercel.app/auth/login", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ lineID: userData.userLineId }),
                    });

                    if (accessTokenResponse.ok) {
                      const accessTokenData = await accessTokenResponse.json();
                      await localStorage.setItem("accessToken", accessTokenData.access_token);
                      navigate("/");
                    } else {
                      throw new Error("Failed to fetch access token");
                    }
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
          } else {
            throw new Error("Failed to fetch user data");
          }
        } catch (error) {
          console.error("Error checking user existence:", error);
        }
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <div>loading...</div>
      <div>User ID: {userLineData?.userLineId}</div>
      <div>User Name: {userLineData?.userLineName}</div>
    </div>
  );
};
