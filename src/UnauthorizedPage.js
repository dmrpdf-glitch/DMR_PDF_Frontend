import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const UnauthorizedPage = () => {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "#f8f9fa",
        padding: "20px",
      }}
    >
      <div
        className="card shadow-lg border-0 text-center"
        style={{
          maxWidth: "500px",
          width: "100%",
          borderRadius: "16px",
        }}
      >
        <div className="card-body p-5">

          <h1
            className="mb-3"
            style={{
              fontSize: "3rem",
            }}
          >
            🚫
          </h1>

          <h2 className="fw-bold text-danger mb-3">
            Access Denied
          </h2>

          <p className="text-muted mb-4">
            You do not have permission
            to view this page.
          </p>

          <button
            className="btn btn-primary"
            onClick={() =>
              (window.location.href = "/")
            }
          >
            Back to Login
          </button>

        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;