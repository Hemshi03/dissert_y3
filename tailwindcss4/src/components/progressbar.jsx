import React from "react";

const ProgressBar = ({ progress }) => {
  const containerStyles = {
    height: "20px",
    width: "100%",
    backgroundColor: "#1C1F3C", // Dark background color from your app
    borderRadius: "50px",
    overflow: "hidden",
  };

  const fillerStyles = {
    height: "100%",
    width: `${progress}%`,
    backgroundImage: "linear-gradient(to right, #4a90e2, #7a63ff)", // Gradient from blue to purple
    borderRadius: "inherit",
    transition: "width 0.5s ease-in-out",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end", // Align text to the right
  };

  const labelStyles = {
    padding: "5px 10px", // Add more padding for a better look
    color: "white",
    fontWeight: "bold",
    fontSize: "12px", // Smaller font size
  };

  return (
    <div style={containerStyles}>
      <div style={fillerStyles}>
        <span style={labelStyles}>{`${progress}%`}</span>
      </div>
    </div>
  );
};

export default ProgressBar;