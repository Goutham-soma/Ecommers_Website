import { Navigate } from "react-router-dom";

// Blocks access to any route if user is not logged in
export default function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
