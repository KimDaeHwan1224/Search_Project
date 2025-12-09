import React from "react";
import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "ADMIN") {
    alert("관리자만 접근할 수 있습니다.");
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
