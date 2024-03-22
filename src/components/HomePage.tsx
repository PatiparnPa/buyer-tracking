import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MyAppBar from "./AppBar";
import TabBar from "./Tabbar";
import Cart from "../assets/cart.jpg";
import { useUser } from "./UserContext";

type Store = {
  _id: string;
  name: string;
  store_img_url: string;
  bank_name: string;
  owner_name: string;
  card_num: number;
  qr_img_url: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type FavoriteFood = {
  id: number;
  name: string;
  store: string;
  image: string;
};

type MenuItem = {
  id: string;
  name: string;
  image: string;
  store: string;
  store_id: string; // Add store_id property
};

type BasketItem = {
  productID: string;
  quantity: number;
  orderDetail: string;
};

export const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stores, setStores] = useState<Store[]>([]);
  const [favoriteFoods, setFavoriteFoods] = useState<MenuItem[]>([]);
  const {userId, basketId, favoriteId} = useUser()

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/userlogin');
    } else {
      
    }
  }, [navigate]);
  // Function to add a menu item to the cart
const addToCart = async (menuItem: MenuItem) => {
  try {
    const basketUrl = `https://order-api-patiparnpa.vercel.app/baskets/${basketId}`;

    // Fetch existing items in the basket
    const response = await fetch(basketUrl);
    if (!response.ok) {
      throw new Error("Error fetching basket data");
    }
    const basketData = await response.json();
    console.log("Basket Data before update:", basketData);

    // Extract existing items or initialize an empty object
    const items = basketData?.items || {};

    // Extract existing items for the specified store_id or initialize an empty array
    const existingItemsForStore = items[menuItem.store_id] || [];

    // Check if the product already exists in the basket
    const existingProductIndex = existingItemsForStore.findIndex(
      (item: BasketItem) => item.productID === menuItem.id
    );

    let updatedItems; // Declare updatedItems variable

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

    console.log("Updated items:", updatedItems);

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

    // Item successfully added to the basket
    console.log("Item added to cart successfully!");
  } catch (error) {
    console.error("Error adding item to cart:", error);
  }
};

  useEffect(() => {
    // Fetch store data from the API
    const fetchStores = async () => {
      try {
        const response = await fetch(
          "https://order-api-patiparnpa.vercel.app/stores/Open"
        );
        const data = await response.json();
        setStores(data);
      } catch (error) {
        console.error("Error fetching store data:", error);
      }
    };

    fetchStores();
  }, []);

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
              const productResponse = await fetch(
                `https://order-api-patiparnpa.vercel.app/products/${productId}`
              );
              if (productResponse.ok) {
                const productData = await productResponse.json();

                // Find the corresponding store details
                const storeDetails = stores.find(
                  (store) => store._id === productData.store_id
                );

                return {
                  id: productData._id,
                  name: productData.name,
                  store_id: storeDetails?._id || "Unknown Store id",
                  store: storeDetails?.name || "Unknown Store", // Use store name, or 'Unknown Store' if not found
                  image: productData.product_img_url,
                  tag: productData.product_tag,
                  price: productData.price,
                };
              }
              return null; // Handle error case
            }
          );

          const productDetails = await Promise.all(productDetailsPromises);

          const filteredProductDetails = productDetails.filter(Boolean);

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
  }, [stores]);

  return (
    <>
      <MyAppBar />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "0 5%",
        }}
      >
        <p style={{ fontWeight: "bold", fontSize: "20px" }}>Favorite Food</p>
        <p
          onClick={() => navigate("/favmenu")}
          style={{
            textDecoration: "none",
            color: "#2357A5",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          See all
        </p>
      </div>
      <div className="scroll-container">
        {favoriteFoods.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              marginTop: "40px",
              marginLeft: "50px",
            }}
          >
            User does not have favorite food.
          </p>
        ) : (
          favoriteFoods.map((food) => (
            <div
              key={food.id}
              className="food-card"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/menufea2/${food.id}`)}
            >
              <img src={food.image} alt={food.name} />
              <p>{food.name}</p>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p>{food.store}</p>
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
          ))
        )}
      </div>
      <div style={{ margin: "4% 5%" }}>
        <p style={{ fontWeight: "bold", fontSize: "20px" }}>เลือกร้านค้า</p>
        <div className="store-container">
          {stores.map((store) => (
            <div className="store-card" key={store._id}>
              <div
                onClick={() =>
                  navigate(`/menupage/${store._id}`, {
                    state: { storeName: store.name },
                  })
                }
                className="store-link"
                style={{
                  textDecoration: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                <img src={store.store_img_url} alt={store.name} />
                <p>{store.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <br />
      <TabBar />
    </>
  );
};