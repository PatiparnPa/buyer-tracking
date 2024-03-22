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
  const [message, setMessage] = useState(""); // State to hold message
  const [imageUrl, setImageUrl] = useState("");
  

  const compareStrings = (str1: string, str2: string): boolean => {
    // Preprocess strings to remove prefixes
    const preprocessedStr1 = removePrefixes(str1);
    const preprocessedStr2 = removePrefixes(str2);

    // Convert both preprocessed strings to lowercase
    const lowerStr1 = preprocessedStr1.toLowerCase();
    const lowerStr2 = preprocessedStr2.toLowerCase();

    // Check if one preprocessed string includes the other
    return lowerStr1.includes(lowerStr2) || lowerStr2.includes(lowerStr1);
  };

  // Function to remove prefixes from a string
  const removePrefixes = (str: string): string => {
    // Define an array of prefixes to remove
    const prefixesToRemove = ["นาย", "นาง", "นางสาว"]; // Add more prefixes as needed

    // Loop through the array of prefixes and remove them from the string
    for (const prefix of prefixesToRemove) {
      if (str.startsWith(prefix)) {
        // Remove the prefix from the string
        str = str.slice(prefix.length);
        // If a prefix is removed, break the loop to prevent removing multiple prefixes
        break;
      }
    }

    // Return the string with prefixes removed
    return str.trim(); // Trim any leading or trailing whitespace
  };

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
      console.log("image:", imageUrl);
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

  const handleUploadSlip = async () => {
    try {
      const response = await fetch(
        "https://order-api-patiparnpa-patiparnpas-projects.vercel.app/slipok/check-slip",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: imageUrl,
          }),
        }
      );
      const responseData = await response.json(); // Parse response data as JSON
      if (response.ok) {
        console.log("Slip uploaded successfully");
        console.log("Response data:", responseData);
        setMessage("Slip uploaded successfully");

        // Compare the bank name and owner name with store data
        const storeResponse = await fetch(
          `https://order-api-patiparnpa.vercel.app/stores/${storeId}`
        );
        const storeData = await storeResponse.json();

        // Preprocess and compare owner name and displayName
        const ownerName = storeData.owner_name;
        const displayName = responseData.data.receiver.displayName;
        const isSimilar = compareStrings(ownerName, displayName);
        if (
          responseData.data.receivingBank === storeData.bank_name &&
          isSimilar
        ) {
          console.log("Bank name and owner name match with store data");
          setMessage("Bank name and owner name match with store data");

          // Fetch order data using orderId
          const orderResponse = await fetch(
            `https://order-api-patiparnpa.vercel.app/orders/${orderId}`
          );
          const orderData = await orderResponse.json();

          // Compare the amount from responseData with the order amount
          if (responseData.data.amount === orderData.amount) {
            console.log("Amount matches with order data");
            setMessage("Amount matches with order data");
            // All comparisons passed successfully
            console.log("All data matches");
            setMessage("All data matches");

            // Create a record of the payment in the database
            const createPaymentResponse = await fetch(
              "https://order-api-patiparnpa-patiparnpas-projects.vercel.app/payments/create",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  store_id: storeId,
                  user_id: userId,
                  order_id: orderId,
                  payment_status: "success",
                  slip_url: imageUrl,
                }),
              }
            );
            const createPaymentData = await createPaymentResponse.json();
            if (createPaymentResponse.ok) {
              console.log(
                "Payment record created successfully:",
                createPaymentData
              );
              setMessage("Payment record created successfully");

              // Update the payment status of the order
              const updateOrderResponse = await fetch(
                `https://order-api-patiparnpa.vercel.app/orders/${orderId}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    payment_method_status: "paid",
                  }),
                }
              );
              const updateOrderData = await updateOrderResponse.json();
              if (updateOrderResponse.ok) {
                console.log(
                  "Payment status of the order updated successfully:",
                  updateOrderData
                );
                setMessage("Payment status of the order updated successfully");
              } else {
                console.error(
                  "Failed to update payment status of the order:",
                  updateOrderData
                );
                setMessage("Failed to update payment status of the order");
              }
            } else {
              console.error(
                "Failed to create payment record:",
                createPaymentData
              );
              setMessage("Failed to create payment record");
            }
          } else {
            console.log("Amount does not match with order data");
            console.log("amount1", responseData.data.amount);
            console.log("amount2", orderData.amount);
            setMessage("Amount does not match with order data");
          }
        } else {
          console.log("Bank name or owner name does not match with store data");
          console.log("receiveBank", responseData.data.receivingBank);
          console.log("bank_name", storeData.bank_name);
          console.log("issimilair", isSimilar);
          setMessage("Bank name or owner name does not match with store data");
        }
      } else {
        console.error("check", responseData.error.message);
        setMessage(`Error: ${responseData.error.message}`);
      }
    } catch (error: any) {
      console.error("Error uploading slip:", error);
      setMessage(`Error: ${error.message}`);
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
      <div
        style={{ textAlign: "center", marginTop: "25%" }}
        onClick={handleImageContainerClick}
      >
        <label htmlFor="fileInput">
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Uploaded Image"
                style={{ width: "238px", height: "238px", padding: "20px" }}
              />
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
        <input
          type="file"
          id="fileInput"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <div style={{ fontSize: "18px", fontWeight: "bold" }}>
          Please upload your payment slip
        </div>
        <div style={{ padding: "10px" }}>{message}...</div>
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
            cursor: imageUrl ? "pointer" : "not-allowed", // Set cursor to pointer if imageUrl is not empty
            opacity: imageUrl ? 1 : 0.5, // Adjust opacity to indicate disabled state if imageUrl is empty
          }}
          onClick={handleUploadSlip}
          disabled={imageUrl === ""}
        >
          Upload Slip
        </button>
      </div>
    </>
  );
};
