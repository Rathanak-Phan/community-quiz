import React from "react";
import DashboardLayout from "./DashboardLayout.jsx";

const Dashboard = () => {
  const role = "user"; 

  return (
    <DashboardLayout role={role}>
      <h1>Dashboard Page</h1>
    </DashboardLayout>
  );
};

export default Dashboard;