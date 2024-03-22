import { useNavigate, useLocation } from "react-router-dom";
import Goback from "../assets/goback.png";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface MenuItem {
  productId: string;
  quantity: number;
  orderDetail: string;
}

interface ProductDetail {
  _id: string;
  name: string;
  price: number;
}
interface QueueDetail {
  queueNumber: string;
  queueLeft: number;
}

interface OrderDetail {
  _id: string;
  productIDs: MenuItem[];
  userID: string;
  storeID: string;
  amount: number;
  status: string;
  payment_method_status: string;
  createdAt: string;
  updatedAt: string;
}

export const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [menuDetails, setMenuDetails] = useState<ProductDetail[]>([]);
  const [queueNumber, setQueueNumber] = useState<string>("");
  const [queueLeft, setQueueLeft] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const storeName = location.state?.storeName || "ร้านค้า";

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await fetch(
          `https://order-api-patiparnpa.vercel.app/orders/${orderId}`
        );
        if (response.ok) {
          const data = await response.json();
          setOrderDetail(data);
          // Fetch menu details for each product ID
          const menuPromises = data.productIDs.map((item: MenuItem) =>
            fetchMenuDetails(item.productId)
          );
          const menuDetails = await Promise.all(menuPromises);
          setMenuDetails(menuDetails);
        } else {
          console.error("Failed to fetch order detail");
        }
      } catch (error) {
        console.error("Error fetching order detail:", error);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  useEffect(() => {
    const fetchQueueNumber = async () => {
      try {
        const response = await fetch(
          `https://order-api-patiparnpa.vercel.app/queues/order/${orderId}`
        );
        if (response.ok) {
          const data: QueueDetail[] = await response.json();
          if (data.length > 0) {
            setQueueNumber(data[0].queueNumber);
            setQueueLeft(data[0].queueLeft);
          }
        } else {
          console.error("Failed to fetch queue number");
        }
      } catch (error) {
        console.error("Error fetching queue number:", error);
      }
    };

    fetchQueueNumber();
  }, [orderId]);

  const fetchMenuDetails = async (productId: string) => {
    try {
      const response = await fetch(
        `https://order-api-patiparnpa.vercel.app/products/${productId}`
      );
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error("Failed to fetch menu details");
        return null;
      }
    } catch (error) {
      console.error("Error fetching menu details:", error);
      return null;
    }
  };

  const handleGoBack = () => {
    navigate("/order"); // Navigate back
  };

  const handleReceivedOrder = async () => {
    try {
      const response = await fetch(`https://order-api-patiparnpa.vercel.app/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'close' }) // Update the order status to "close"
      });
  
      if (response.ok) {
        // Reload the page upon successfully updating the order status
        window.location.reload();
      } else {
        console.error('Failed to mark order as received');
      }
    } catch (error) {
      console.error('Error marking order as received:', error);
    }
  };
  

  const handleClick = () => {
    if (orderDetail) {
      navigate(`/slip/${orderDetail.storeID}`, { state: { orderId: orderId } });
    }
  };

  const handleCancelOrder = async () => {
    try {
      const response = await fetch(`https://order-api-patiparnpa.vercel.app/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'cancel' }) // Update the order status to "cancel"
      });
  
      if (response.ok) {
        // Reload the page upon successful cancellation
        window.location.reload();
      } else {
        console.error('Failed to cancel order');
      }
    } catch (error) {
      console.error('Error canceling order:', error);
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "open":
        return "Wait for cooking";
      case "ready":
        return "The order is ready";
      case "close":
        return "DONE";
      case "cancel":
        return "The order is cancel";
      default:
        return "";
    }
  };

  const getStatusMessage2 = (status: string) => {
    switch (status) {
      case "open":
        return "Please wait for a moment...";
      case "ready":
        return "Your order is ready.";
      case "close":
        return "Your already received the order.";
      case "cancel":
        return "Your order was cancelled.";
      default:
        return "";
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
      {orderDetail && (
        <>
          <div className="custom-heading">
            Status: {getStatusMessage(orderDetail.status)}
          </div>
          <div className="order-summary-queue">
            <div style={{ fontSize: "18px", fontWeight: "bold" }}>
              Your queue is
            </div>
            <div style={{ fontSize: "51px", fontWeight: "bold" }}>
              {queueNumber}
            </div>
            <div
              style={{ fontSize: "18px", fontWeight: "bold", color: "#9FA5AF" }}
            >
              {orderDetail && getStatusMessage2(orderDetail.status)}
            </div>
          </div>
          <div className="custom-heading">Order Summary</div>
          {menuDetails.map((item: ProductDetail, index: number) => (
            <div className="my-order-detail-box" key={index}>
              <div
                className="left-content"
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginRight: "-55%",
                }}
              >
                {orderDetail.productIDs[index].quantity}x
              </div>
              <div className="center-content">
                <div className="my-order-shop">{item.name}</div>
                <div className="my-order-date">
                  {orderDetail.productIDs[index].orderDetail !== ""
                    ? orderDetail.productIDs[index].orderDetail
                    : "ไม่มี"}
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
                    color: item.price === null ? "red" : "inherit",
                  }}
                >
                  {item.price !== null ? (
                    `${
                      item.price * orderDetail.productIDs[index].quantity
                    } Bath`
                  ) : (
                    <span style={{ color: "red" }}>0 Bath</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <br></br>
          <br></br>
          <br></br>
          <div
            style={{
              position: "fixed",
              bottom: 0,
              width: "100%",
              textAlign: "center",
              padding: "10px",
            }}
          >
            {orderDetail.status === "open" && (
              <button onClick={handleCancelOrder} className="button-overlay">
                Cancel Order
              </button>
            )}
            {orderDetail.status === "ready" && (
              <button
                onClick={handleReceivedOrder}
                className="button-overlay"
                style={{ backgroundColor: "#2357A5" }}
              >
                Received Order
              </button>
            )}
            {orderDetail.status === "close" &&
              orderDetail.payment_method_status === "scan" && (
                <button
                  onClick={handleClick}
                  className="button-overlay"
                  style={{ backgroundColor: "#2357A5" }}
                >
                  Scan QR for pay
                </button>
              )}
          </div>
        </>
      )}
    </>
  );
};