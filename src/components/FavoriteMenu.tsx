import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Goback from "../assets/goback.png";
import Redbin from "../assets/redbin.png";
import Cart from "../assets/cart.jpg";
import Logo from "../assets/logo.jpg";
import { useUser } from "./UserContext";

interface BasketItem {
  productID: string;
  quantity: number;
  orderDetail: string;
}

interface FavoriteFood {
  id: string;
  name: string;
  image: string;
  tag: string;
  price: number;
}

interface MenuItem {
  id: string;
  name: string;
  image: string;
  tag: string;
  price: number;
  store_id: string;
}

export const FavoriteMenus: React.FC = () => {
  const navigate = useNavigate();
  const [isManageMode, setIsManageMode] = useState(false);
  const [favoriteFoods, setFavoriteFoods] = useState<MenuItem[]>([]);
  const { userId, basketId, favoriteId } = useUser();

  const handleGoBack = () => {
    navigate(-1); // Navigate back
  };

  const handleManageClick = () => {
    setIsManageMode(!isManageMode);
  };

  const manageButtonStyles = {
    background: "none",
    border: "none",
    fontSize: "18px",
    fontWeight: "bold",
    width: "80px",
    color: isManageMode ? "white" : "#FF3A3A",
  };

  const overlayStyles: React.CSSProperties = {
    backgroundColor: "#505050",
    opacity: 0.8,
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 999,
  };

  const addToCart = async (menuItem: MenuItem) => {
    try {
      const basketUrl = `https://order-api-patiparnpa.vercel.app/baskets/${basketId}`;

      // Fetch existing basket data
      const response = await fetch(basketUrl);
      if (!response.ok) {
        throw new Error("Error fetching basket data");
      }
      const basketData = await response.json();
      const items = basketData?.items || {};

      // Extract existing items for the specified store_id or initialize an empty array
      const existingItemsForStore = items[menuItem.store_id] || [];

      // Check if the product already exists in the basket
      const existingProductIndex = existingItemsForStore.findIndex(
        (item: BasketItem) => item.productID === menuItem.id
      );

      let updatedItems;

      if (existingProductIndex !== -1) {
        // If the product already exists, update its quantity
        updatedItems = {
          ...items,
          [menuItem.store_id]: [
            ...existingItemsForStore.slice(0, existingProductIndex),
            {
              ...existingItemsForStore[existingProductIndex],
              quantity: existingItemsForStore[existingProductIndex].quantity + 1,
            },
            ...existingItemsForStore.slice(existingProductIndex + 1),
          ],
        };
      } else {
        // If the product doesn't exist, add it as a new item
        updatedItems = {
          ...items,
          [menuItem.store_id]: [
            ...existingItemsForStore,
            {
              productID: menuItem.id,
              quantity: 1,
              orderDetail: '',
            },
          ],
        };
      }

      // Update the basket with the new item
      const putResponse = await fetch(basketUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: updatedItems,
        }),
      });

      if (!putResponse.ok) {
        throw new Error("Error updating basket data");
      }

      console.log("Item added to cart successfully!");
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  useEffect(() => {
    const fetchFavoriteFoods = async () => {
      try {
        const response = await fetch(
          `https://order-api-patiparnpa.vercel.app/favorite_products/user/${userId}`
        );

        if (response.ok) {
          const favoriteProducts = await response.json();

          const productIDs = favoriteProducts[0]?.productIDs || [];

          const productDetailsPromises = productIDs.map(
            async (productId: string) => {
              try {
                const productResponse = await fetch(
                  `https://order-api-patiparnpa.vercel.app/products/${productId}`
                );

                if (productResponse.ok) {
                  const productData = await productResponse.json();

                  return {
                    id: productData._id,
                    name: productData.name,
                    image: productData.product_img_url,
                    tag: productData.product_tag,
                    price: productData.price,
                    store_id: productData.store_id
                  };
                } else {
                  console.error(
                    "Error fetching product details:",
                    productResponse.statusText
                  );
                  return null;
                }
              } catch (error) {
                console.error("Error fetching product details:", error);
                return null;
              }
            }
          );

          const productDetails = await Promise.all(productDetailsPromises);
          const filteredProductDetails = productDetails.filter(
            Boolean
          ) as MenuItem[];

          setFavoriteFoods(filteredProductDetails);
        } else {
          console.error(
            "Error fetching favorite products:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error fetching favorite products:", error);
      }
    };

    fetchFavoriteFoods();
  }, []);

  const removeFromFavorites = async (favoriteProductId: string) => {
    try {
      // Fetch the favorite products data
      const response = await fetch(
        `https://order-api-patiparnpa.vercel.app/favorite_products/${favoriteId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch favorite products data");
      }
      const favoriteProductsData = await response.json();
  
      // Remove the specified productId from the productIDs array
      const updatedProductIDs = favoriteProductsData.productIDs.filter(
        (productId: string) => productId !== favoriteProductId
      );
  
      // Update the favorite products data on the server
      const putResponse = await fetch(
        `https://order-api-patiparnpa.vercel.app/favorite_products/${favoriteId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...favoriteProductsData,
            productIDs: updatedProductIDs,
          }),
        }
      );
  
      if (!putResponse.ok) {
        throw new Error("Failed to update favorite products data on the server");
      }
  
      // Update the UI after successful removal
      setFavoriteFoods((prevFavoriteFoods) =>
        prevFavoriteFoods.filter((food) => food.id !== favoriteProductId)
      );
  
      console.log("Menu removed from favorites successfully!");
    } catch (error) {
      console.error("Error removing menu from favorites:", error);
    }
  };
  
  

  return (
    <>
      <div
        className="app-bar"
        style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}
      >
        <button
          onClick={handleGoBack}
          style={{
            textDecoration: "none",
            marginLeft: "3%",
            marginRight: "-60%",
            marginBottom: "-1%",
            color: "white",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <img
            src={Goback}
            alt="Go back"
            style={{ marginRight: "8px", width: "28px", height: "28px" }}
          />
        </button>
        <h5 style={{ marginTop: "2%", textAlign: "left", marginLeft: "150px" }}>
          My Favorite Menu
        </h5>
        <div className="right-elements">
          <div className="elements-container">
            <button style={manageButtonStyles} onClick={handleManageClick}>
              {isManageMode ? "Cancel" : "Manage"}
            </button>
          </div>
        </div>
      </div>
      <div className="store-container">
        {favoriteFoods.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            User does not have favorite menu.
          </p>
        ) : (
          favoriteFoods.map((food) => (
            <div
              key={food.id}
              className="menus-card"
              style={{
                marginLeft: "5px",
                marginRight: "5px",
                position: "relative",
              }}
            >
              {isManageMode ? (
                <button
                  className="store-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle button click logic here
                    console.log("Button clicked");
                  }}
                ></button>
              ) : (
                <div
                  onClick={() => navigate(`/menufea2/${food.id}`)}
                  className="store-link"
                  style={{ cursor: "pointer" }}
                >
                  <img src={food.image} alt={food.name} />
                  <p>{food.name}</p>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <p>{food.price} บาท</p>
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        marginLeft: "5px",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(food);
                      }}
                    >
                      <img
                        src={Cart}
                        alt="Cart"
                        style={{ width: "30px", height: "30px" }}
                      />
                    </button>
                  </div>
                </div>
              )}
              {isManageMode && (
                <div
                  style={overlayStyles}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromFavorites(food.id);
                  }}
                >
                  <img
                    src={Redbin}
                    alt="Redbin"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "73px",
                      height: "95px",
                    }}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
};
