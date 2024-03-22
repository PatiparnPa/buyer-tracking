import { useState, useEffect } from "react";
import Heart from "../assets/heart-removebg-preview.png";
import Heart2 from "../assets/heart-removebg-preview-removebg-preview.png";
import { useUser } from "./UserContext";

type HeartButtonProps = {
  menuId?: string;
};

export const HeartButton: React.FC<HeartButtonProps> = ({ menuId}) => {
  const {userId, basketId, favoriteId} = useUser()
  const [isHeartActive, setIsHeartActive] = useState(false);
  const [favoriteMenuId, setFavoriteMenuId] = useState<string | undefined>(undefined);
  const [userFavoriteProductIDs, setUserFavoriteProductIDs] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    const checkFavoriteStatus = async () => {
      try {
        const existingFavoriteMenuResponse = await fetch(
          `https://order-api-patiparnpa.vercel.app/favorite_products/user/${userId}`
        );

        if (existingFavoriteMenuResponse.ok) {
          const existingFavoriteMenu = await existingFavoriteMenuResponse.json();
          console.log("Existing favorite menu:", existingFavoriteMenu);

          const menuIds = existingFavoriteMenu[0]?.productIDs || [];
          setUserFavoriteProductIDs(menuIds);

          const isMenuInFavorite = menuIds.includes(menuId || "");
          setIsHeartActive(isMenuInFavorite);

          if (existingFavoriteMenu[0]?._id) {
            console.log("Favorite menu ID found:", existingFavoriteMenu[0]._id);
            setFavoriteMenuId(existingFavoriteMenu[0]._id);
          } else {
            console.warn("Favorite menu ID is undefined.");
          }
        } else if (existingFavoriteMenuResponse.status === 404 && isMounted) {
          // If user's favorite menu is not found, create a new one with an empty array
          const newFavoriteMenu = {
            userID: userId,
            productIDs: [],
          };

          const createFavoriteMenuResponse = await fetch(
            "https://order-api-patiparnpa.vercel.app/favorite_products/create",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(newFavoriteMenu),
            }
          );

          if (!createFavoriteMenuResponse.ok) {
            throw new Error("Network response was not ok");
          }

          const createdFavoriteMenuData = await createFavoriteMenuResponse.json();
          console.log("New favorite menu created:", createdFavoriteMenuData);
          setFavoriteMenuId(createdFavoriteMenuData._id);
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    // Fetch and check if the menu is already in the favorite list on component mount
    checkFavoriteStatus();

    return () => {
      // Cleanup function to set isMounted to false when the component unmounts
      isMounted = false;
    };
  }, [menuId, userId]);

  const toggleHeart = async () => {
    try {
      // Check if menuId and favoriteMenuId are defined
      if (menuId && favoriteMenuId) {
        const existingFavoriteMenuResponse = await fetch(
          `https://order-api-patiparnpa.vercel.app/favorite_products/${favoriteMenuId}`
        );
  
        if (existingFavoriteMenuResponse.ok) {
          const existingFavoriteMenu = await existingFavoriteMenuResponse.json();
  
          // Ensure that productIDs is an array before filtering or mapping
          const updatedProductIDs = isHeartActive
            ? userFavoriteProductIDs.filter((productId) => productId !== menuId)
            : [...userFavoriteProductIDs, menuId];

          setUserFavoriteProductIDs(updatedProductIDs);

          const updatedFavoriteMenu = {
            userID: userId,
            productIDs: updatedProductIDs,
          };
  
          const favoriteMenuResponse = await fetch(
            `https://order-api-patiparnpa.vercel.app/favorite_products/${favoriteMenuId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(updatedFavoriteMenu),
            }
          );
  
          if (!favoriteMenuResponse.ok) {
            throw new Error("Network response was not ok");
          }
  
          const favoriteMenuData = await favoriteMenuResponse.json();
          console.log("Favorite menu updated:", favoriteMenuData);
          setIsHeartActive((prev) => !prev);
        }
      } else {
        console.error("menuId or favoriteMenuId is undefined");
      }
    } catch (error) {
      console.error("Error updating favorite menu:", error);
    }
  };
  
  return (
    <>
      <button
        style={{ background: "none", border: "none", cursor: "pointer", marginRight: '5px' }}
        onClick={toggleHeart}
      >
        <img
          src={isHeartActive ? Heart2 : Heart}
          alt="heart"
          style={{ width: "25px", height: "25px" }}
        ></img>
      </button>
    </>
  );
};