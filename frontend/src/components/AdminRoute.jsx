import ProtectedRoute from "./ProtectedRoute";

function AdminRoute({ children }) {
  return (
    <ProtectedRoute roles={["admin"]}>
      {children}
    </ProtectedRoute>
  );
}

export default AdminRoute;
