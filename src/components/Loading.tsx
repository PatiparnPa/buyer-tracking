import React, { useState, useEffect } from "react";

export const Loading = () => {
  const [userLineData, setUserLineData] = useState<{
    userLineId: string | null;
    userLineName: string | null;
  } | null>(null);

  useEffect(() => {
    // Retrieve userData from localStorage
    const userDataString = localStorage.getItem("userLineData");

    // Parse the userData JSON string to extract userId and displayName
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      setUserLineData(userData);
    }
  }, []); // Empty dependency array ensures useEffect runs only once on component mount

  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <div>loading...</div>
      <div>User ID: {userLineData?.userLineId}</div>
      <div>User Name: {userLineData?.userLineName}</div>
    </div>
  );
};
