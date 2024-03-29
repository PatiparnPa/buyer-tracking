import { useNavigate } from "react-router-dom";
import Goback from "../assets/goback.png";
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useUser } from "./UserContext";

interface StoreDetail {
  qr_img_url: string;
  store_img_url: string;
}

export const UploadSlip = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { storeId } = useParams<{ storeId: string }>();
  const { orderId } = location.state || {};
  const [storeDetail, setStoreDetail] = useState<StoreDetail | null>(null);
  const { userId, basketId, favoriteId } = useUser();

  useEffect(() => {
    const fetchStoreDetail = async () => {
      try {
        const response = await fetch(
          `https://order-api-patiparnpa.vercel.app/stores/${storeId}`
        );
        if (response.ok) {
          const data: StoreDetail = await response.json();
          setStoreDetail(data);
        } else {
          console.error("Failed to fetch store detail");
        }
      } catch (error) {
        console.error("Error fetching store detail:", error);
      }
    };

    fetchStoreDetail();
  }, [storeId]);

  const handleGoBack = () => {
    navigate(-1); // Navigate back
  };

  const qrCodeUrl = storeDetail?.qr_img_url || ""; // Use the fetched qr_img_url

  const handleSave = async () => {
    try {
      // Get the image element
      const img = document.getElementById("qrCodeImage") as HTMLImageElement;

      if (img) {
        console.log("Image element found.");

        // Create a canvas element
        const canvas = document.createElement("canvas");

        // Get the 2D context of the canvas
        const context = canvas.getContext("2d");

        if (context) {
          console.log("2D context obtained successfully.");

          // Set the canvas dimensions to match the image dimensions
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw the image onto the canvas
          context.drawImage(img, 0, 0, img.width, img.height);

          // Convert the canvas content to a data URL
          const dataUrl = canvas.toDataURL("image/png");

          // Create a virtual link element
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = "seller_qr_code.png"; // Set the desired file name

          // Trigger a click on the link to initiate the download
          link.click();
          console.log("Download initiated.");
        } else {
          console.error("Failed to get 2D context for canvas.");
        }
      } else {
        console.error("Image element not found.");
      }
    } catch (error) {
      console.error("Error saving image:", error);
    }
  };

  const handleUpload = () => {
    navigate("/slip2", { state: { storeId: storeId, orderId: orderId } });
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
        <h5 style={{ marginTop: "2%", marginLeft: "3%" }}>อัปโหลดสลีป</h5>
        <div className="right-elements">
          <div className="elements-container">
            {/* Add other elements as needed */}
          </div>
        </div>
      </div>
      <div className="upload-slip-container">
        <img
          id="qrCodeImage"
          src={qrCodeUrl}
          alt="Seller QR Code"
          style={{ width: "100%", padding: "10px" }}
        />
        <button
          onClick={handleSave}
          style={{
            background: "#D9D9D9",
            color: "black",
            padding: "10px 40px",
            fontSize: "17px",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
            marginTop: "10px",
            fontWeight: "bold",
          }}
        >
          บันทึก
        </button>
      </div>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <div
        style={{
          position: "fixed",
          bottom: 5,
          width: "100%",
          textAlign: "center",
          padding: "10px",
        }}
      >
        <button
          onClick={handleUpload}
          className="button-overlay"
          style={{
            background: "#2357A5",
          }}
        >
          Upload Slip
        </button>
      </div>
    </>
  );
};
