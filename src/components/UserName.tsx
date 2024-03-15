import { Link } from "react-router-dom";
import Goback from "../assets/goback.png";
import { useState, useEffect } from "react";
import { useUser } from "./UserContext";

export const UserName = () => {
  const [newName, setNewName] = useState("");
  const {userId, basketId, favoriteId} = useUser()
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  };

  const handleSaveClick = async () => {
    try {
      const response = await fetch(
        `https://order-api-patiparnpa.vercel.app/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newName }),
        }
      );

      if (response.ok) {
        console.log("Name updated successfully:", newName);
        setIsSuccess(true); // Update state to show success message
        // Implement any further actions after successful update
      } else {
        console.error("Failed to update name");
      }
    } catch (error) {
      console.error("Error updating name:", error);
    }
  };

  return (
    <>
      <div
        className="app-bar"
        style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}
      >
        <Link
          to="/profile"
          style={{
            textDecoration: "none",
            marginLeft: "3%",
            marginRight: "-60%",
            marginBottom: "-1%",
            color: "white",
          }}
        >
          <img
            src={Goback}
            alt="Go back"
            style={{ marginRight: "8px", width: "28px", height: "28px" }}
          />
        </Link>
        <h5 style={{ marginTop: "2%", marginLeft: "10%" }}>Display Name</h5>
        <div className="right-elements">
          <div className="elements-container">
            {/* Add other elements as needed */}
          </div>
        </div>
      </div>
      <div className="user-input-container">
        <label htmlFor="newName" className="input-label"></label>
        <input
          type="text"
          id="newName"
          value={newName}
          onChange={handleInputChange}
          placeholder="New Name"
          className="user-input"
          required
        />
        {isSuccess && (
        <div style={{ marginLeft: "10px" }}>
          <div>Name updated successfully!</div>
        </div>
      )}
        <button onClick={handleSaveClick} className="save-button">
          Save
        </button>
      </div>
    </>
  );
};
