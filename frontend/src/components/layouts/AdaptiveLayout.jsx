import { useAuth } from "../../context/AuthContext";
import MainLayout from "./MainLayout";
import Sidebar from "./SideBar";

export default function AdaptiveLayout() {
  const { token } = useAuth();

  // If user is logged in, show the Dashboard Sidebar layout
  if (token) {
    return <Sidebar />;
  }

  // Otherwise show the public MainLayout (Header/Footer)
  return <MainLayout />;
}
