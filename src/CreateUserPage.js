import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const roles = ["MD", "ADMIN"]; // Backend allowed roles

const CreateUserPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const navigate = useNavigate();

  // Backend API from .env
  const API = process.env.REACT_APP_API_URL;

  // Create User Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password || !role) {
      alert("⚠️ Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      setLoadingMessage("Creating User...");

      await axios.post(`${API}/create`, {
        username,
        password,
        role,
      });

      alert("✅ User created successfully!");

      // Reset form
      setUsername("");
      setPassword("");
      setRole("");

      setTimeout(() => {
        setLoading(false);
      }, 600);

    } catch (error) {
      console.error(error);

      if (error.response?.status === 409) {
        alert("⚠️ Username already exists");
      } else {
        alert("⚠️ Failed to create user");
      }

      setLoading(false);
    }
  };

  // Full screen blur spinner
  const SpinnerOverlay = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        background: "rgba(255,255,255,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        zIndex: 9999,
      }}
    >
      <div
        className="spinner-border text-primary mb-3"
        style={{
          width: "3rem",
          height: "3rem",
        }}
      ></div>

      <h4 className="fw-bold text-dark">
        {loadingMessage}
      </h4>
    </div>
  );

  return (
    <div className="container mt-5 position-relative">

      {/* Loading Spinner */}
      {loading && SpinnerOverlay}

      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6">

          <div className="card shadow rounded-4 border-0">

            {/* Header */}
            <div className="card-header bg-primary text-white fw-bold">
              <i className="bi bi-person-plus-fill me-2"></i>
              Create New User
            </div>

            <div className="card-body p-4">

              <form
                onSubmit={handleSubmit}
                autoComplete="off"
              >

                {/* Username */}
                <div className="mb-3">
                  <label className="form-label">
                    <strong>Username</strong>
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value)
                    }
                    required
                  />
                </div>

                {/* Password */}
                <div className="mb-3">
                  <label className="form-label">
                    <strong>Password</strong>
                  </label>

                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                  />
                </div>

                {/* Role */}
                <div className="mb-4">
                  <label className="form-label">
                    <strong>Role</strong>
                  </label>

                  <select
                    className="form-select"
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value)
                    }
                    required
                  >
                    <option value="">
                      Select Role
                    </option>

                    {roles.map((r) => (
                      <option
                        key={r}
                        value={r}
                      >
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit Button */}
                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Create User
                  </button>
                </div>

              </form>

              {/* Bottom Navigation Buttons */}
              <div className="d-flex justify-content-between align-items-center mt-4">

                <button
                  className="btn btn-info btn-sm"
                  onClick={() =>
                    navigate("/user-insights")
                  }
                >
                  <i className="bi bi-card-list me-1"></i>
                  User List
                </button>

                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() =>
                    navigate("/admin")
                  }
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Back to Admin
                </button>

              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateUserPage;