import React, { useState, ChangeEvent, useEffect } from "react";
import Goback from "../assets/goback.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useUser } from "./UserContext";

interface Item {
  orderDetail: string;
  productID: string;
  quantity: number;
  _id: string;
  productType: string;
  // Add other properties if needed
}

export const ConfirmOrder: React.FC = () => {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();
  const location = useLocation();
  const {userId, basketId, favoriteId} = useUser()
  const [selectedMethod, setSelectedMethod] = useState("payAtStore");

  const handleMethodChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedMethod(event.target.value);
  };

  const hasCustomProduct = () => {
    if (basketData && basketData.items && storeId) {
      const itemsForStore = basketData.items[storeId];
      return itemsForStore.some((item: Item) => item.productType === "custom");
    }
    return false;
  };

  const storeName = location.state?.storeName || "ร้านค้า";

  const handleGoBack = () => {
    navigate(-1); // Navigate back
  };
  const [basketData, setBasketData] = useState<any>(null);

  useEffect(() => {
    console.log("basketData:", basketData);
  }, [basketData]); // Log basketData whenever it changes

  useEffect(() => {
    const fetchBasketData = async () => {
      try {
        const response = await fetch(
          `https://order-api-patiparnpa.vercel.app/baskets/${basketId}`
        );
        if (response.ok) {
          const data = await response.json();

          // Ensure data.items and data.items[storeId] are not undefined
          const itemsForStore =
            data.items && storeId && data.items[storeId]
              ? data.items[storeId]
              : [];

          // Fetch product details for each menu
          const productPromises = itemsForStore.map(async (item: Item) => {
            const productResponse = await fetch(
              `https://order-api-patiparnpa.vercel.app/products/${item.productID}`
            );
            if (productResponse.ok) {
              const productData = await productResponse.json();
              return {
                ...item,
                productName: productData.name,
                productPrice: productData.price,
                productType: productData.product_type,
              };
            } else {
              console.error(
                "Failed to fetch product details for productId:",
                item.productID
              );
            }
          });

          // Wait for all product detail fetch requests to resolve
          const productsData = await Promise.all(productPromises);

          // Filter out any null values (failed product detail fetch requests)
          const filteredProductsData = productsData.filter(
            (product) => product !== null
          );

          // Update basketData with product details
          setBasketData({
            ...data,
            items: { [storeId || ""]: filteredProductsData },
          });
        } else {
          console.error("Failed to fetch basket data");
        }
      } catch (error) {
        console.error("Error fetching basket data:", error);
      }
    };

    fetchBasketData();
  }, []); // Remove storeId from the dependency array

  const totalPrice =
    basketData && basketData.items && storeId && basketData.items[storeId]
      ? basketData.items[storeId].reduce(
          (total: number, item: any) =>
            total + item.productPrice * item.quantity,
          0
        )
      : 0;

  const handlePlaceOrder = async () => {
    try {
      if (!storeId) {
        console.error("Store ID is undefined");
        return;
      }

      // Fetch the latest basket data from the server
      const basketResponse = await fetch(
        `https://order-api-patiparnpa.vercel.app/baskets/${basketId}`
      );
      if (!basketResponse.ok) {
        throw new Error("Failed to fetch basket data");
      }
      const basketServer = await basketResponse.json();

      const orderData = {
        productIDs: basketServer?.items?.[storeId]?.map((item: any) => ({
          productId: item.productID,
          quantity: item.quantity,
          orderDetail: item.orderDetail,
        })),
        userID: userId,
        storeID: storeId,
        amount: totalPrice,
        status: "open",
        payment_method_status:
          selectedMethod === "payAtStore" ? "cash" : "scan",
        payStatus: "waitingForPayment",
      };

      const response = await fetch(
        "https://order-api-patiparnpa.vercel.app/orders/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );

      if (response.ok) {
        console.log("Order placed successfully!");

        // Extract the _id of the newly created order from the response
        const { _id } = await response.json();

        // Update the basket by removing items corresponding to the ordered store
        const updatedItems = { ...basketServer.items };
        delete updatedItems[storeId];

        const updatedBasket = {
          ...basketServer,
          items: updatedItems,
        };

        const updateResponse = await fetch(
          `https://order-api-patiparnpa.vercel.app/baskets/${basketId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedBasket),
          }
        );

        if (updateResponse.ok) {
          console.log("Basket updated successfully!");
          // Redirect the user to a success page or perform other actions
          navigate(`/orderdetail/${_id}`, { state: { storeName: storeName } });
        } else {
          console.error("Failed to update basket");
        }
      } else {
        console.error("Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
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
      {basketData &&
        basketData.items &&
        storeId &&
        basketData.items[storeId] && (
          <>
            <div className="custom-heading">Order Summary</div>
            {basketData.items[storeId].map((item: any, index: number) => (
              <div className="my-order-detail-box" key={index}>
                <div
                  className="left-content"
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    marginRight: "-55%",
                  }}
                >
                  {item.quantity}x
                </div>
                <div className="center-content">
                  <div className="my-order-shop">{item.productName}</div>
                  <div className="my-order-date" style={{ color: "red" }}>
                    Delete
                  </div>
                </div>
                <div
                  className="right-content"
                  style={{ overflow: "hidden", whiteSpace: "nowrap" }}
                >
                  <div
                    className="my-order-price"
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: item.productPrice === null ? "red" : "inherit",
                    }}
                  >
                    {item.productPrice !== null
                      ? `${item.productPrice * item.quantity} Bath`
                      : "0 Bath"}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      <div className="custom-heading" style={{ paddingTop: "15px" }}>
        วิธีการชำระเงิน
      </div>
      <div
        className="my-order-detail-box"
        style={{ fontSize: "18px", fontWeight: "bold" }}
      >
        <label>
          <input
            id="payAtStore"
            type="radio"
            value="payAtStore"
            checked={selectedMethod === "payAtStore"}
            onChange={handleMethodChange}
            style={{ width: "20px", height: "20px", marginRight: "10px" }}
          />
          Pay at the Store (cash)
        </label>
      </div>
      <div
        className="my-order-detail-box"
        style={{ fontSize: "18px", fontWeight: "bold" }}
      >
        <label>
          <input
            id="scanQRCode"
            type="radio"
            value="scanQRCode"
            checked={selectedMethod === "scanQRCode"}
            onChange={handleMethodChange}
            style={{ width: "20px", height: "20px", marginRight: "10px" }}
            disabled={hasCustomProduct()}
          />
          Scan QR Code
        </label>
      </div>
      <br></br>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px",
          fontSize: "18px",
          fontWeight: "bolder",
          backgroundColor: "#ffffff", // Optional background color
        }}
      >
        <div style={{ color: "#000000" }}>Total</div>
        <div style={{ color: "#000000" }}>{totalPrice} Bath</div>
      </div>
      <div
        style={{
          textAlign: "center",
          position: "fixed",
          bottom: "0",
          width: "100%",
          marginBottom: "5px",
        }}
      >
        <button
          onClick={handlePlaceOrder}
          style={{
            backgroundColor: "#2357A5",
            border: "none",
            width: "95%",
            color: "#FFFFFF",
            height: "56px",
            borderRadius: "10px",
            fontSize: "18px",
          }}
        >
          Place Order
        </button>
      </div>
    </>
  );
};