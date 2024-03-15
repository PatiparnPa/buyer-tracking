import TabBar from "./Tabbar";
import Cart2 from "../assets/cart2.png";
import { Link, useNavigate } from "react-router-dom";
import Logout from "../assets/logout.jpg";
import GoNext from "../assets/yeet.jpg";
import React, { useEffect, useState } from "react";
import { UserName } from "./UserName";
import liff from "@line/liff"; // Import LIFF library
import { useUser } from "./UserContext";

export const UserProfilePage = () => {
  const {userId, basketId, favoriteId} = useUser()
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/userlogin');
    } else {
    }
  }, [navigate]);

  const initializeLiff = async () => {
    try {
      // Initialize LIFF
      await liff.init({ liffId: "2000210581-wLmA5Enp" });
    } catch (error) {
      console.error("LIFF initialization failed:", error);
      // Handle the initialization error here, such as displaying an error message
      return; // Exit the function to prevent further execution
    }
  
    // Proceed with any other initialization steps if LIFF initialization succeeds
  };
  
  useEffect(() => {
    initializeLiff();
  }, []);


  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await fetch(
          `https://order-api-patiparnpa.vercel.app/users/${userId}`
        );
        if (response.ok) {
          const userData = await response.json();
          setUserName(userData.name);
        } else {
          console.error("Failed to fetch user name");
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
      }
    };

    fetchUserName();
  }, [userId]);


  const handleLogout = () => {
    try {
      // Check if the user is logged in
      if (liff.isLoggedIn()) {
        // Logout from LINE
        liff.logout();
      }
  
      // Remove access token from local storage
      localStorage.removeItem("accessToken");
      navigate('/userlogin');
      // Navigate to user login page
      console.log("Logout successful");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  return (
    <>
      <div
        className="app-bar"
        style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}
      >
        <h5 style={{ marginTop: "3%", marginLeft: "3%" }}>My Profile</h5>
        <div className="right-elements">
          <div className="elements-container">
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                marginLeft: "5px",
                marginTop: "5px",
              }}
            >
              <img
                src={Cart2}
                alt="Cart"
                style={{ width: "33px", height: "33px" }}
              />
            </button>
          </div>
        </div>
      </div>
      <div className="user-profile-container">
        <p
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            padding: "20px",
            paddingBottom: "10px",
            fontFamily: "prompt",
          }}
        >
          Personal Information
        </p>
        <div className="profile-item" style={{ alignItems: "center" }}>
          <div className="label">Display Name</div>
          <Link to="/name" style={{ textDecoration: "none" }}>
            <div style={{ fontSize: "18px" }}>{userName}</div>
          </Link>
        </div>
        <div className="profile-item">
          <div className="label">Edit Favorite Menu</div>
          <Link to="/favmenu" className="link">
            <img
              src={GoNext}
              alt="link"
              style={{ width: "30px", height: "30px" }}
            ></img>
          </Link>
        </div>
        <div className="profile-item" style={{ alignItems: "center" }}>
          <div className="label">History Order</div>
          <Link to="/order" className="link">
            <img
              src={GoNext}
              alt="link"
              style={{ width: "30px", height: "30px" }}
            ></img>
          </Link>
        </div>
        <div className="profile-item">
          <button
            onClick={handleLogout}
            style={{ border: "none", background: "none", fontSize: "18px" }}
          >
            <img src={Logout}></img> Logout
          </button>
        </div>
      </div>
      <TabBar></TabBar>
    </>
  );
};
