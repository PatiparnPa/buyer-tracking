import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Goback from "../assets/goback.png";
import Cart from "../assets/cart.jpg";
import Logo from "../assets/logo.jpg";
import { useParams } from "react-router-dom";
import { useUser } from "./UserContext";

interface Menu {
  _id: string;
  name: string;
  product_img_url: string;
  product_tag: string;
  price: number;
  store_id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface BasketItem {
  productID: string;
  quantity: number;
  orderDetail: string;
}

export const MenuPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuData, setMenuData] = useState<Menu[]>([]);
  const [error, setError] = useState<string | null>(null);
  const {userId, basketId, favoriteId} = useUser()

  const { storeId } = useParams();

  // Access store name from location state
  const storeName = location.state?.storeName || "ร้านค้า";

  useEffect(() => {
    // Fetch menu data for the specific store using storeId
    fetch(`https://order-api-patiparnpa.vercel.app/products/store/${storeId}/normal`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setMenuData(data);
      })
      .catch((error) => {
        console.error("Error fetching menu data:", error);
        setError("Failed to fetch menu data. Please try again.");
      });
  }, [storeId]); // Include storeId in the dependency array

  const handleGoBack = () => {
    navigate(-1); // Navigate back
  };

  const addToCart = async (menu: Menu) => {
    try {
      const basketUrl = `https://order-api-patiparnpa.vercel.app/baskets/${basketId}`;

      // Fetch existing items in the basket
      const response = await fetch(basketUrl);
      if (!response.ok) {
        throw new Error("Error fetching basket data");
      }
      const basketData = await response.json();

      // Initialize items object if it doesn't exist in basketData
      const items = basketData?.items || {};

      // Extract existing items for the specified store_id or initialize an empty array
      const existingItemsForStore = items[menu.store_id] || [];

      // Check if the product already exists in the basket
      const existingProductIndex = existingItemsForStore.findIndex(
        (item: BasketItem) => item.productID === menu._id
      );

      let updatedItems;

      if (existingProductIndex !== -1) {
        // If the product already exists, update its quantity
        updatedItems = {
          ...items,
          [menu.store_id]: [
            ...existingItemsForStore.slice(0, existingProductIndex),
            {
              ...existingItemsForStore[existingProductIndex],
              quantity:
                existingItemsForStore[existingProductIndex].quantity + 1,
            },
            ...existingItemsForStore.slice(existingProductIndex + 1),
          ],
        };
      } else {
        // If the product doesn't exist, add it as a new item with quantity 1
        updatedItems = {
          ...items,
          [menu.store_id]: [
            ...existingItemsForStore,
            { productID: menu._id, quantity: 1, orderDetail: '' },
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
        <h5 style={{ marginTop: "2%", marginLeft: "3%" }}>{storeName}</h5>
        <div className="right-elements">
          <div className="elements-container">
            {/* Add other elements as needed */}
          </div>
        </div>
      </div>
      <div className="store-container">
        <div
          onClick={() => navigate(`/menufea1/${storeId}`, { state: { storeName } })}
          className="menus-card"
          style={{ marginLeft: "5px", marginRight: "5px" }}
        >
          <div className="store-link" style={{ cursor: "pointer" }}>
            <img src={Logo} alt="custom menu"></img>
            <p>เมนูตามสั่ง(พิมพ์ด้วยตัวเอง)</p>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <p>Custom price</p>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  marginLeft: "5px",
                }}
                onClick={() => {
                  console.log("Button clicked!");
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
        </div>
        {menuData.map((menu) => (
          <div
            key={menu._id}
            onClick={() => navigate(`/menufea2/${menu._id}`)}
            className="menus-card"
            style={{ marginLeft: "5px", marginRight: "5px" }}
          >
            <div className="store-link" style={{ cursor: "pointer" }}>
              <img src={menu.product_img_url} alt={menu.name} />
              <p>{menu.name}</p>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p>{menu.price} บาท</p>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    marginLeft: "5px",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(menu);
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
          </div>
        ))}
      </div>
    </>
  );
};