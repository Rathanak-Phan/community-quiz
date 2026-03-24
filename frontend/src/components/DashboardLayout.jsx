import React from "react";

const DashboardLayout = ({ role, children }) => {
  const menuItems = {
    admin: ["Manage Categories", "View Communities"],
    quiz_maker: ["My Quizzes", "Dashboard"],
    user: ["Browse Quizzes", "Favorites"]
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* Sidebar */}
      <div style={{ width: "250px", background: "#f4f4f4", padding: "20px" }}>
        <h3>Menu</h3>

        {menuItems[role]?.map((item, index) => (
          <p key={index}>{item}</p>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "20px" }}>
        {children}
      </div>

    </div>
  );
};

export default DashboardLayout;