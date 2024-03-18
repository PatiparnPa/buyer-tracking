// AnyComponent.tsx
import { usePopup } from "./PopupContext";
import PopupComponent from "./PopupComponent";
import { useState } from "react";
import React, { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useUser } from "./UserContext";
import axios from "axios";

const AnyComponent: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleImageUpload = async () => {
    if (!imageUrl) {
      console.error("Image URL is not available.");
      return;
    }

    try {
      const response = await axios.post(
        "https://api.slipok.com/api/line/apikey/18131",
        {
          url: imageUrl,
        },
        {
          headers: {
            "x-authorization": "SLIPOK8H819O3",
          },
        }
      );

      // Handle response here, check if the slip is valid or not
      console.log("Slip checking response:", response.data);
    } catch (error) {
      console.error("Error uploading slip:", error);
      // Handle error
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setImageFile(file);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileInputChange} accept="image/*" />
      {imageFile && (
        <div>
          <h2>Selected Image:</h2>
          <img src={imageUrl || ""} alt="Selected Image" />
        </div>
      )}
      <button onClick={handleImageUpload}>Upload Slip</button>
    </div>
  );
};

export default AnyComponent;
