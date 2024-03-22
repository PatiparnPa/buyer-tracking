import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Goback from "../assets/goback.png";
import { HeartButton } from "./Heartbutton";
import { useUser } from "./UserContext";

interface BasketItem {
  productID: string;
  quantity: number;
  _id: string;
  orderDetail: string;
}

export const SelectMenuFeature2 = () => {
  const navigate = useNavigate();
  const { menuId } = useParams();
  const { userId, basketId, favoriteId } = useUser();
  const [menuData, setMenuData] = useState({
    _id: "",
    name: "เมนู",
    product_img_url: "",
    product_tag: "",
    price: 0,
    store_id: "",
    status: "",
    createdAt: "",
    updatedAt: "",
    __v: 0,
  });
  const [quantity, setQuantity] = useState(1);
  const [basketItems, setBasketItems] = useState({});
  const [note, setNote] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNote(e.target.value);
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate back
  };

  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://order-api-patiparnpa.vercel.app/products/${menuId}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setMenuData(data);
        console.log("Menu Data:", data);
      } catch (error) {
        console.error("Error fetching menu data:", error);
        // Handle the error as needed, e.g., redirect to an error page
      }
    };

    fetchData();
  }, [menuId]);

  const handleAddToBasket = async () => {
    try {
      const basketUrl = `https://order-api-patiparnpa.vercel.app/baskets/${basketId}`;
  
      const response = await fetch(basketUrl);
      if (!response.ok) {
        throw new Error("Error fetching basket data");
      }
  
      const basketData = await response.json();
      console.log("Basket Data before update:", basketData);
  
      // Extract existing items or initialize an empty object
      const items = basketData?.items || {};
  
      // Extract existing items for the specified store_id or initialize an empty array
      const existingItemsForStore = items[menuData.store_id] || [];
  
      // Check if the product already exists in the basket
      const existingProductIndex = existingItemsForStore.findIndex(
        (item: BasketItem) => item.productID === menuData._id
      );
  
      let updatedItems; // Declare updatedItems variable
  
      if (existingProductIndex !== -1) {
        // If the product already exists, update its quantity
        updatedItems = {
          ...items,
          [menuData.store_id]: [
            ...existingItemsForStore.slice(0, existingProductIndex),
            {
              ...existingItemsForStore[existingProductIndex],
              quantity: existingItemsForStore[existingProductIndex].quantity + quantity,
              orderDetail: note,
            },
            ...existingItemsForStore.slice(existingProductIndex + 1),
          ],
        };
      } else {
        // If the product doesn't exist, add it as a new item
        updatedItems = {
          ...items,
          [menuData.store_id]: [
            ...existingItemsForStore,
            {
              productID: menuData._id,
              quantity: quantity,
              orderDetail: note, 
            },
          ],
        };
      }
  
      console.log("Updated items:", updatedItems);
  
      setBasketItems(updatedItems);
  
      const putData = {
        userID: userId,
        items: updatedItems,
      };
  
      const putResponse = await fetch(basketUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(putData),
      });
  
      if (!putResponse.ok) {
        throw new Error("Error updating basket data");
      }
  
      console.log("Successfully added to basket!");
  
      // Navigate back to the previous page
      navigate(-1);
    } catch (error) {
      console.error("Error adding to basket:", error);
      // Handle the error as needed
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
        <div className="right-elements">
          <div className="elements-container">
            <HeartButton menuId={menuId} />
          </div>
        </div>
      </div>
      <div className="menu-container">
        <div className="menu-image-container">
          <img
            src={menuData.product_img_url}
            className="menu-img"
            alt="Menu Image"
          />
        </div>
        <div className="menu-container-details">
          <div className="menu-details-content">
            <div className="menu-text">
              <p style={{ fontSize: "22px" }}>
                <b>{menuData.name}</b>
              </p>
              <p style={{ fontSize: "18px" }}>
                <b>{menuData.price} Bath</b>
              </p>
            </div>
          </div>
          <div className="menu-form-detail">
            <p style={{ fontWeight: "bold", fontSize: "18px" }}>
              Note to store
            </p>
            <input
              type="text"
              id="noteToStore"
              placeholder="Message"
              className="menu-input"
              value={note}
              onChange={handleInputChange}
            />
            <p style={{ fontSize: "14px" }}>
              *Enter your note to store here(optional)
            </p>
            <br></br>
            <div className="menu-amount-option">
              <button onClick={handleDecrement}>-</button>
              <p>{quantity}</p>
              <button onClick={handleIncrement}>+</button>
            </div>
            <div className="menu-buttons">
              <button className="menu-button" onClick={handleAddToBasket}>
                Add to basket
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
