import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "./LoginPage";
import DrawingViewerPage from "./DrawingViewerPage";
import AdminPage from "./AdminPage";
import UploadedDataPage from "./UploadedDataPage";
import CreateUserPage from "./CreateUserPage";
import UserInsightsPage from "./UserInsightsPage";
import ProtectedRoute from "./ProtectedRoute";
import LogoutListener from "./LogoutListener";
import UnauthorizedPage from "./UnauthorizedPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  // Keep localStorage and state synced
  useEffect(() => {
    localStorage.setItem(
      "isLoggedIn",
      isAuthenticated ? "true" : "false"
    );
  }, [isAuthenticated]);

  return (
    <Router>
      {/* Auto logout listener */}
      <LogoutListener />

      <Routes>
        {/* Login Page */}
        <Route
          path="/"
          element={
            <LoginPage
              setIsAuthenticated={setIsAuthenticated}
            />
          }
        />

        {/* Normal User + Admin Drawing Viewer */}
        <Route
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
            />
          }
        >
          <Route
            path="/drawing"
            element={<DrawingViewerPage />}
          />
        </Route>

        {/* ADMIN Only Routes */}
        <Route
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              allowedRoles={["ADMIN"]}
            />
          }
        >
          <Route
            path="/admin"
            element={<AdminPage />}
          />

          <Route
            path="/uploadeddata"
            element={<UploadedDataPage />}
          />

          <Route
            path="/create-user"
            element={<CreateUserPage />}
          />

          <Route
            path="/user-insights"
            element={<UserInsightsPage />}
          />
        </Route>

        {/* Unauthorized Page */}
        <Route
          path="/unauthorized"
          element={<UnauthorizedPage />}
        />

        {/* Catch all route */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;