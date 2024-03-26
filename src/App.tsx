import "./App.css";
import { HomePage } from "./components/HomePage";
import OrderPage from "./components/OrderPage";
import { Routes, Route, Navigate } from "react-router-dom";
import { UserProfilePage } from "./components/MyProfile";
import { SelectMenuFeature } from "./components/SelectMenuFeature";
import { SelectMenuFeature2 } from "./components/SelectMenuFeature2";
import { UserLogin } from "./components/UserLogin";
import { MenuPage } from "./components/MenuPage";
import { FavoriteMenus } from "./components/FavoriteMenu";
import GlobalStyles from "./components/GlobalStyle";
import { UserName } from "./components/UserName";
import { MyCart } from "./components/MyCart";
import AnyComponent from "./components/AnyComponent";
import { OrderDetail } from "./components/OrderDetail";
import { ConfirmOrder } from "./components/ConfirmOrder";
import { UploadSlip } from "./components/UploadSlip";
import { UploadSlip2 } from "./components/UploadSlip2";
import React, { useState, useEffect } from "react";
import PopupComponent from "./components/PopupComponent";
import { usePopup } from "./components/PopupContext";
import Pot from "./assets/pot-removebg-preview.png";
import { useNavigate } from "react-router-dom";
import { Loading } from "./components/Loading";
import { useUser } from "./components/UserContext";

// Define the Order interface
interface Order {
  _id: string;
  userID: string;
  storeID: string;
  amount: number;
  storeName: string; // New property for store name
  queueNumber: string;
}

function App() {
  const { isPopupOpen, openPopup, closePopup } = usePopup();
  const {userId, basketId, favoriteId} = useUser()

  const navigate = useNavigate();

  const handleGoToOrderPage = (orderId: string, storeName: string) => {
    closePopup();
    navigate(`/orderdetail/${orderId}`, {
      state: { storeName: storeName },
    });
  };



  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          `https://order-api-patiparnpa.vercel.app/orders/user/${userId}/ready`
        );
        if (response.ok) {
          const data: Order[] = await response.json();
          if (data.length > 0) {
            const storeId = data[0].storeID;
            if (storeId) {
              // Fetch store details using storeId
              const storeResponse = await fetch(
                `https://order-api-patiparnpa.vercel.app/stores/${storeId}`
              );
              if (storeResponse.ok) {
                const storeData = await storeResponse.json();

                // Add storeName to the first order
                data[0].storeName = storeData.name;
              } else {
                console.error(
                  "Failed to fetch store details:",
                  storeResponse.statusText
                );
              }

              // Fetch queue number using orderId
              const queueResponse = await fetch(
                `https://order-api-patiparnpa.vercel.app/queues/order/${data[0]._id}`
              );
              if (queueResponse.ok) {
                const queueData = await queueResponse.json();

                // Add queueNumber to the first order
                data[0].queueNumber = queueData[0]?.queueNumber ?? "Unknown";
              } else {
                console.error(
                  "Failed to fetch queue number:",
                  queueResponse.statusText
                );
              }
            } else {
              console.error("StoreId is undefined");
            }
            console.log("data", data);

            openPopup(
              <div>
                <img src={Pot} style={{ width: "170px" }}></img>
                <p style={{ fontSize: "51px", fontWeight: "bolder" }}>
                  {data[0]?.queueNumber}
                </p>
                <p style={{ fontWeight: "600", fontSize: "18px" }}>
                  Your Order is done!!
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: "400",
                    fontSize: "16px",
                    color: "#000000",
                  }}
                >
                  <p style={{ margin: 0 }}>{data[0]?.storeName}</p>
                  <p>{data[0]?.amount} Bath</p>
                </div>
                <br></br>
                <button
                  className="to-order-page-button"
                  onClick={() =>
                    handleGoToOrderPage(data[0]?._id, data[0]?.storeName)
                  }
                >
                  Go to order Page
                </button>
              </div>
            );
          }
        } else {
          console.error("Failed to fetch orders:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    let intervalId = setInterval(fetchOrders, 25000);

    return () => {
      clearInterval(intervalId);
    };
  }, [userId, openPopup]);

  return (
    <div>
      <GlobalStyles></GlobalStyles>
      {isPopupOpen && <PopupComponent onClose={closePopup} />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/profile" element={<UserProfilePage></UserProfilePage>} />
        <Route path="/menufea1/:storeId" element={<SelectMenuFeature />} />
        <Route path="/menufea2/:menuId" element={<SelectMenuFeature2 />} />
        <Route path="/userlogin" element={<UserLogin></UserLogin>}></Route>
        <Route
          path="/menupage/:storeId"
          element={<MenuPage></MenuPage>}
        ></Route>
        <Route
          path="/favmenu"
          element={<FavoriteMenus></FavoriteMenus>}
        ></Route>
        <Route path="/name" element={<UserName></UserName>}></Route>
        <Route path="/mycart" element={<MyCart></MyCart>}></Route>
        <Route path="/yee" element={<AnyComponent></AnyComponent>}></Route>
        <Route
          path="/orderdetail/:orderId"
          element={<OrderDetail></OrderDetail>}
        ></Route>
        <Route
          path="/confirmorder/:storeId"
          element={<ConfirmOrder></ConfirmOrder>}
        ></Route>
        <Route
          path="/slip/:storeId"
          element={<UploadSlip></UploadSlip>}
        ></Route>
        <Route path="/slip2" element={<UploadSlip2></UploadSlip2>}></Route>
        <Route path="/load" element={<Loading></Loading>}></Route>
      </Routes>
    </div>
  );
}

export default App;
