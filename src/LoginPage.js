import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function LoginPage({ setIsAuthenticated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const API = process.env.REACT_APP_BACKEND_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API}/login`, {
        username,
        password,
      });

      const { username: savedUser, role } = response.data.user;

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", savedUser);
      localStorage.setItem("role", role);

      setIsAuthenticated(true);

      try {
        await axios.post(`${API}/log-login`, {
          username: savedUser,
        });
      } catch (logError) {
        console.error("Login log error:", logError);
      }

      if (role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/drawing");
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Login failed. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="loading-overlay">
          <div
            className="spinner-border text-warning"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          ></div>
        </div>
      )}

      <div className="login-wrapper d-flex align-items-center justify-content-center min-vh-100">
        <div className="login-card position-relative">
          <div className="year-badge">
            <div className="badge-inner">
              <span>Celebrating</span>
              <h2>75</h2>
              <span>Years</span>
            </div>
          </div>

          <div className="text-center mb-4">
            <p className="subtitle">Legacy of Excellence</p>
            <h1 className="brand-name">DINAMALAR</h1>
            <p className="sub-text">Office & Plant Drawings</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="form-label custom-label">Username</label>
              <input
                type="text"
                className="form-control custom-input"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label custom-label">Password</label>
              <input
                type="password"
                className="form-control custom-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-danger small mb-3">{error}</p>}

            <button
              type="submit"
              className="btn login-btn w-100"
              disabled={loading}
            >
              {loading ? "Please wait..." : "SUBMIT"}
            </button>
          </form>

          <div className="footer-note mt-4">
            Do not share drawings without Management approval.
          </div>
        </div>
      </div>
    </>
  );
}
