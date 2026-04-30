import React from "react";
import {
  Navigate,
  Outlet,
} from "react-router-dom";

const ProtectedRoute = ({
  isAuthenticated,
  allowedRoles,
}) => {
  // Get role from localStorage
  const role =
    localStorage.getItem("role");

  // If not logged in → go to Login Page
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  // If role restriction exists and role not allowed
  if (
    allowedRoles &&
    !allowedRoles.includes(role)
  ) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  // Allow access
  return <Outlet />;
};

export default ProtectedRoute;