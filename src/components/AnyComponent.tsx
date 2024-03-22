import { useState } from "react";

const AnyComponent: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setImageFile(files[0]);
    }
  };

  const handleUploadImage = async () => {
    if (!imageFile) {
      console.error("No image selected.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("img", imageFile);

      const response = await fetch(
        "https://upload2firebase.vercel.app/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to upload image: ${response.statusText}`);
      }

      // Check if the response content type is JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const responseData = await response.json();
        console.log("Response from server:", responseData);
        console.log("Response from server:", response);
      } else {
        // If response is not JSON, log the response text
        const responseText = await response.text();
        console.log("Response from serverrrrrrrrrrrr:", responseText);
        console.log("Response from server:", response);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUploadImage}>Upload Image</button>
    </div>
  );
};

export default AnyComponent;
