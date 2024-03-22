import { Link, useLocation, LinkProps } from "react-router-dom";
import Goback from "../assets/goback.png";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import GoNext from "../assets/yeet.jpg";
import { useUser } from "./UserContext";

interface StoreItem {
  productID: string;
  quantity: number;
  _id: string;
}

interface BasketData {
  [storeId: string]: StoreItem[];
}

interface Store {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
}

export const MyCart = () => {
  const navigate = useNavigate();
  const [isManageMode, setIsManageMode] = useState(false);
  const [basketData, setBasketData] = useState<BasketData | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [totalPrices, setTotalPrices] = useState<{ [storeId: string]: number }>(
    {}
  );
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
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

  const handleCheckboxChange = (storeId: string) => {
    if (selectedOrders.includes(storeId)) {
      setSelectedOrders(selectedOrders.filter((id) => id !== storeId));
    } else {
      setSelectedOrders([...selectedOrders, storeId]);
    }
  };

  const handleDeleteOrders = async () => {
    try {
      const updatedBasketData = { ...basketData };

      selectedOrders.forEach((storeId) => {
        delete updatedBasketData[storeId];
      });

      const basketUrl =
      `https://order-api-patiparnpa.vercel.app/baskets/${basketId}`;
      const response = await fetch(basketUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: updatedBasketData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update basket data on the server");
      }

      setBasketData(updatedBasketData);
      setSelectedOrders([]);
      console.log("Basket data updated successfully on the server");
    } catch (error) {
      console.error("Error updating basket data:", error);
    }
  };

  useEffect(() => {
    const fetchBasketData = async () => {
      try {
        const response = await fetch(
          `https://order-api-patiparnpa.vercel.app/baskets/${basketId}`
        );
        if (response.ok) {
          const data = await response.json();
          setBasketData(data.items); // Set order data from API response
        } else {
          console.error("Failed to fetch order data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching order data:", error);
      }
    };

    fetchBasketData();
  }, []);

  useEffect(() => {
    if (!basketData) return; // Exit if basketData is null

    const fetchStores = async () => {
      try {
        const storeIds = Object.keys(basketData);
        const storePromises = storeIds.map(async (storeId) => {
          const response = await fetch(
            `https://order-api-patiparnpa.vercel.app/stores/${storeId}`
          );
          if (response.ok) {
            const storeData = await response.json();
            return storeData;
          } else {
            console.error(
              `Failed to fetch store data for store ID ${storeId}:`,
              response.statusText
            );
            return null;
          }
        });
        const storesData = await Promise.all(storePromises);
        setStores(storesData.filter((store) => store !== null));
      } catch (error) {
        console.error("Error fetching store data:", error);
      }
    };

    fetchStores();
  }, [basketData]);

  useEffect(() => {
    if (!basketData) return; // Exit if basketData is null

    const fetchProductPrices = async () => {
      try {
        const totalPriceData: { [storeId: string]: number } = {};
        for (const storeId in basketData) {
          const items = basketData[storeId];
          let totalPrice = 0;
          for (const item of items) {
            const response = await fetch(
              `https://order-api-patiparnpa.vercel.app/products/${item.productID}`
            );
            if (response.ok) {
              const productData: Product = await response.json();
              totalPrice += productData.price * item.quantity;
            } else {
              console.error(
                `Failed to fetch product data for product ID ${item.productID}:`,
                response.statusText
              );
            }
          }
          totalPriceData[storeId] = totalPrice;
        }
        setTotalPrices(totalPriceData);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchProductPrices();
  }, [basketData]);

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
        <h5 style={{ marginTop: "2%", textAlign: "left", marginLeft: "60px" }}>
          My Cart
        </h5>
        <div className="right-elements">
          <div className="elements-container">
            <button style={manageButtonStyles} onClick={handleManageClick}>
              {isManageMode ? "Cancel" : "Manage"}
            </button>
          </div>
        </div>
      </div>

      {/* Display order items */}
      <div className="order-container">
  {basketData ? (
    Object.keys(basketData).length !== 0 ? (
      stores.map((store) => (
        <div className="order-item" key={store._id}>
          {isManageMode && (
            <div>
              {/* Render checkboxes here */}
              <input
                type="checkbox"
                style={{
                  marginRight: "20px",
                  width: "20px",
                  height: "20px",
                  alignItems: "center",
                }}
                checked={selectedOrders.includes(store._id)}
                onChange={() => handleCheckboxChange(store._id)}
              />
            </div>
          )}
          <div className="left-content">
            <div style={{ fontSize: "18px", fontWeight: "bold" }}>
              {store.name}
            </div>
            <div style={{ fontSize: "18px" }}>
              Select{" "}
              {basketData[store._id]?.reduce(
                (acc, curr) => acc + curr.quantity,
                0
              )}{" "}
              items
            </div>
          </div>
          <div className="right-content">
            <div
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginRight: "5px",
              }}
            >
              {totalPrices[store._id]} Baht
            </div>
            <div
              className="link"
              onClick={() =>
                navigate(`/confirmorder/${store._id}`, {
                  state: { storeName: store.name },
                })
              }
            >
              <img
                src={GoNext}
                alt="link"
                style={{ width: "30px", height: "30px" }}
              />
            </div>
          </div>
        </div>
      ))
    ) : (
      <p style={{ textAlign: "center", marginTop: "20px" }}>
        User has no menu in the basket
      </p>
    )
  ) : (
    <p style={{ textAlign: "center", marginTop: "20px" }}>Loading...</p>
  )}
</div>

      <br></br>
      <br></br>

      {isManageMode && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            width: "100%",
            textAlign: "center",
            padding: "10px",
          }}
        >
          <button
            style={{
              background: "#FF3A3A",
              color: "white",
              width: "95%",
              border: "none",
              height: "56px",
              borderRadius: "10px",
              fontSize: "18px",
              fontWeight: "bold",
            }}
            onClick={handleDeleteOrders}
          >
            Delete
          </button>
        </div>
      )}
    </>
  );
};
