import { useNavigate } from "react-router-dom";
import Goback from "../assets/goback.png";
import Upload from "../assets/upload.png";
import { useUser } from "./UserContext";
import { useLocation } from "react-router-dom";
import { ChangeEvent, useState } from "react";

export const UploadSlip2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = location.state || {};
  const { storeId } = location.state || {};
  const { userId, basketId, favoriteId } = useUser();
  const [imageUrl, setImageUrl] = useState("");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement && inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];
      // Now you can safely use the 'file' variable
      console.log("Selected file:", file);

      // Read the selected file and set it to imageUrl state
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      console.log("image", imageUrl);
    } else {
      console.error("No file selected");
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate back
  };

  const handleImageContainerClick = () => {
    const fileInput = document.getElementById(
      "fileInput"
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.click();
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
        <h5 style={{ marginTop: "2%", marginLeft: "3%" }}>อัปโหลดสลีป</h5>
        <div className="right-elements">
          <div className="elements-container">
            {/* Add other elements as needed */}
          </div>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: "25%" }} onClick={handleImageContainerClick}>
      <label htmlFor="fileInput">
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="Uploaded Image" style={{ width: "238px", height: "238px", padding: "20px" }} />
          ) : (
            <img
              src={Upload}
              alt="Upload"
              style={{
                width: "238px",
                height: "238px",
                padding: "20px",
              }}
            />
          )}
        </button>
      </label>
      <input type="file" id="fileInput" onChange={handleFileChange} style={{ display: 'none' }} />
      <div style={{ fontSize: "18px", fontWeight: "bold" }}>
        Please upload your payment slip
      </div>
    </div>
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
