import GoNext from "../assets/yeet.jpg";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useUser } from "./UserContext";

interface Order {
  _id: string;
  storeID: string;
  createdAt: string;
  status: string;
  storeName: string;
  userID: string;
  amount: number;
  __v: number;
  orderQueue?: string; // Add optional orderQueue property
}

export const RecentOrder = () => {
  const { userId, basketId, favoriteId } = useUser();
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true, // Use 12-hour clock format
    };
    return date.toLocaleDateString("en-US", options);
  };

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const response = await fetch(
          `https://order-api-patiparnpa.vercel.app/orders/user/${userId}`
        );
        if (response.ok) {
          const data: Order[] = await response.json();
          // Fetch store details and queue information for each order
          const ordersWithDetails = await Promise.all(
            data.map(async (order: Order) => {
              const storeResponse = await fetch(
                `https://order-api-patiparnpa.vercel.app/stores/${order.storeID}`
              );
              const queueResponse = await fetch(
                `https://order-api-patiparnpa.vercel.app/queues/order/${order._id}`
              );
              if (storeResponse.ok && queueResponse.ok) {
                const storeData = await storeResponse.json();
                const queueData = await queueResponse.json();
                // Extract the relevant queue information (e.g., queue number)
                const queueNumber = queueData[0]?.queueNumber || "N/A";
                return {
                  ...order,
                  storeName: storeData.name,
                  orderQueue: queueNumber,
                };
              } else {
                console.error(`Failed to fetch details for order ${order._id}`);
                return order;
              }
            })
          );
          setUserOrders(ordersWithDetails);
        } else {
          console.error("Failed to fetch user orders");
        }
      } catch (error) {
        console.error("Error fetching user orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserOrders();
  }, [userId]);

  // Filter orders based on their status
  const onProcessOrders = userOrders.filter((order) => order.status === "open");
  const recentOrders = userOrders.filter((order) => order.status !== "open");

  return (
    <>
      {isLoading && <div>Loading...</div>}
      {!isLoading && userOrders.length === 0 && (
        <div style={{ textAlign: "center" }}>User has no orders.</div>
      )}
      {!isLoading && userOrders.length > 0 && (
        <>
          <div className="custom-heading">On Process</div>
          {onProcessOrders.map((order, index) => (
            <div key={index} className="my-order-detail-box">
              <div
                className="left-content"
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginRight: "-40%",
                }}
              >
                {order.orderQueue} {/* Display order queue number */}
              </div>
              <div className="center-content">
                <div className="my-order-shop">{order.storeName}</div>
                <div className="my-order-date">
                  {formatDate(order.createdAt)}
                </div>
              </div>
              <div
                className="right-content"
                style={{ overflow: "hidden", whiteSpace: "nowrap" }}
              >
                <div
                  className="my-order-price"
                  style={{ fontSize: "18px", fontWeight: "bold" }}
                >
                  {order.amount} Bath
                </div>
                <Link
                  to={`/orderdetail/${order._id}`}
                  state={{ storeName: order.storeName }}
                  className="link"
                >
                  <img
                    src={GoNext}
                    alt="link"
                    style={{ width: "30px", height: "30px" }}
                  />
                </Link>
              </div>
            </div>
          ))}

          <div className="custom-heading" style={{ paddingTop: "12px" }}>
            Recent
          </div>
          {recentOrders.map((order, index) => (
            <div key={index} className="my-order-detail-box">
              {/* Render recent orders similarly */}
              <div
                className="left-content"
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginRight: "-40%",
                }}
              >
                <div className="my-order-shop">{order.storeName}</div>
                <div className="my-order-date">
                  {formatDate(order.createdAt)}
                </div>
              </div>
              <div className="center-content"></div>
              <div
                className="right-content"
                style={{ overflow: "hidden", whiteSpace: "nowrap" }}
              >
                <div
                  className="my-order-price"
                  style={{ fontSize: "18px", fontWeight: "bold" }}
                >
                  {order.amount} Bath
                </div>
                <Link
                  to={`/orderdetail/${order._id}`}
                  state={{ storeName: order.storeName }}
                  className="link"
                >
                  <img
                    src={GoNext}
                    alt="link"
                    style={{ width: "30px", height: "30px" }}
                  />
                </Link>
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
};
