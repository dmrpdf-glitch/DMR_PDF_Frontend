import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

/*
=====================================
Final AdminPage
=====================================

Features:
✅ Upload Drawing
✅ Update Drawing
✅ PDF validation
✅ Manual Logout Save
✅ Browser Close Logout Save
✅ No refresh false logout
✅ Edit mode
✅ Loader support
*/

const locationMap = {
  DMR: {
    Office: [
      "Chennai",
      "Coimbatore",
      "Madurai",
      "Pondy",
      "Bangalore",
      "Bombay",
      "Delhi",
    ],

    Printing_Plant: [
      "Oragadam-chennai",
      "Coimbatore",
      "Madurai",
      "Pondy",
      "Thirunelveli",
    ],
  },
};

const AdminPage = () => {
  const [category, setCategory] = useState("");
  const [place, setPlace] = useState("");
  const [drawingName, setDrawingName] = useState("");
  const [drawingFile, setDrawingFile] = useState(null);
  const [editId, setEditId] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [isLogoutLoading, setIsLogoutLoading] =
    useState(false);

  const reactLocation = useLocation();
  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_URL;
  const location = "DMR";

  /*
  =====================================
  Category Options
  =====================================
  */
  const getCategoryOptions = () =>
    Object.keys(locationMap[location] || {});

  /*
  =====================================
  Place Options
  =====================================
  */
  const getPlaceOptions = () =>
    locationMap[location]?.[category] || [];

  /*
  =====================================
  Edit Mode
  =====================================
  */
  useEffect(() => {
    const queryParams = new URLSearchParams(
      reactLocation.search
    );

    const isEdit = queryParams.get("edit");

    if (isEdit) {
      const editData = JSON.parse(
        localStorage.getItem("editDrawing")
      );

      if (editData) {
        setCategory(editData.category || "");
        setPlace(editData.place || "");
        setDrawingName(
          editData.drawingName || ""
        );
        setEditId(editData._id);
      }
    }
  }, [reactLocation.search]);

  /*
  =====================================
  Browser Close Logout
  =====================================
  Works for:
  - Full browser close
  - Tab close
  - App close

  Uses navigator.sendBeacon()
  because axios is unreliable here
  =====================================
  */
  useEffect(() => {
    const handleBrowserClose = () => {
      const username =
        localStorage.getItem("username");

      if (!username) return;

      const data = JSON.stringify({
        username,
        reason: "browser-close",
      });

      navigator.sendBeacon(
        `${API}/log-logout`,
        new Blob([data], {
          type: "application/json",
        })
      );
    };

    window.addEventListener(
      "beforeunload",
      handleBrowserClose
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBrowserClose
      );
    };
  }, [API]);

  /*
  =====================================
  Submit
  =====================================
  */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !category ||
      !place ||
      !drawingName ||
      (!drawingFile && !editId)
    ) {
      alert("⚠️ Please fill all fields");
      return;
    }

    /*
    PDF Validation
    */
    if (
      drawingFile &&
      drawingFile.type !== "application/pdf"
    ) {
      alert("Only PDF files are allowed");
      return;
    }

    setLoadingMessage(
      editId
        ? "Updating Data..."
        : "Uploading Data..."
    );

    setIsLoading(true);

    const formData = new FormData();

    formData.append("location", "DMR");
    formData.append("category", category);
    formData.append("place", place);
    formData.append("drawingName", drawingName);

    if (drawingFile) {
      formData.append("file", drawingFile);
    }

    try {
      /*
      Update Mode
      */
      if (editId) {
        await axios.put(
          `${API}/drawing/${editId}`,
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

        alert(
          "✅ Drawing updated successfully"
        );

        localStorage.removeItem(
          "editDrawing"
        );
      }

      /*
      Create Mode
      */
      else {
        await axios.post(
          `${API}/upload`,
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

        alert(
          "✅ Drawing uploaded successfully"
        );
      }

      /*
      Reset Form
      */
      setCategory("");
      setPlace("");
      setDrawingName("");
      setDrawingFile(null);
      setEditId(null);

      navigate("/uploadeddata");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.error ||
          "⚠️ Failed to submit drawing"
      );
    } finally {
      setIsLoading(false);
    }
  };

  /*
  =====================================
  Manual Logout Button
  =====================================
  */
  const handleLogout = async () => {
    setIsLogoutLoading(true);

    const username =
      localStorage.getItem("username");

    try {
      if (username) {
        await axios.post(
          `${API}/log-logout`,
          {
            username,
            reason: "manual",
          }
        );
      }
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => {
      localStorage.clear();
      window.location.href = "/";
    }, 1000);
  };

  return (
    <div
      className="container-fluid px-2 px-md-4 mt-3 mt-md-4"
      style={{
        maxWidth: "900px",
      }}
    >
      {/* Upload Loader */}
      {isLoading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backdropFilter: "blur(8px)",
            background:
              "rgba(255,255,255,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            zIndex: 9999,
          }}
        >
          <div
            className="spinner-border text-success mb-3"
            style={{
              width: "3rem",
              height: "3rem",
            }}
          ></div>

          <h5 className="fw-bold">
            {loadingMessage}
          </h5>
        </div>
      )}

      {/* Logout Loader */}
      {isLogoutLoading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backdropFilter: "blur(8px)",
            background:
              "rgba(255,255,255,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            zIndex: 9999,
          }}
        >
          <div
            className="spinner-border text-danger mb-3"
            style={{
              width: "3rem",
              height: "3rem",
            }}
          ></div>

          <h5 className="fw-bold">
            Logging out...
          </h5>
        </div>
      )}

      <div className="card shadow-sm border-0 rounded-4">
        {/* Header */}
        <div
          className="p-3 border-bottom bg-white d-flex justify-content-between align-items-center rounded-top-4"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <span className="fw-bold text-primary">
            <i className="bi bi-person-circle me-2"></i>
            Admin (DMR)
          </span>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() =>
                navigate("/uploadeddata")
              }
            >
              View All
            </button>

            <button
              className="btn btn-outline-success btn-sm"
              onClick={() =>
                navigate("/create-user")
              }
            >
              Create User
            </button>

            <button
              className="btn btn-outline-danger btn-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="card-body p-3 p-md-4">
          <form
            onSubmit={handleSubmit}
            className="row g-3"
          >
            {/* Category */}
            <div className="col-12">
              <label className="form-label fw-semibold">
                Category
              </label>

              <select
                className="form-select"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPlace("");
                }}
                required
              >
                <option value="">
                  Select Category
                </option>

                {getCategoryOptions().map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Place */}
            <div className="col-12">
              <label className="form-label fw-semibold">
                Place
              </label>

              <select
                className="form-select"
                value={place}
                onChange={(e) =>
                  setPlace(e.target.value)
                }
                required
              >
                <option value="">
                  Select Place
                </option>

                {getPlaceOptions().map(
                  (p) => (
                    <option
                      key={p}
                      value={p}
                    >
                      {p}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Drawing Name */}
            <div className="col-12">
              <label className="form-label fw-semibold">
                Drawing Name
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter Drawing Name"
                value={drawingName}
                onChange={(e) =>
                  setDrawingName(
                    e.target.value
                  )
                }
                required
              />
            </div>

            {/* PDF Upload */}
            <div className="col-12">
              <label className="form-label fw-semibold">
                Upload Drawing (PDF)
              </label>

              <input
                type="file"
                className="form-control"
                accept=".pdf"
                onChange={(e) =>
                  setDrawingFile(
                    e.target.files[0]
                  )
                }
                required={!editId}
              />
            </div>

            {/* Submit */}
            <div className="col-12 d-grid mt-2">
              <button
                type="submit"
                className="btn btn-success py-2"
                style={{
                  fontSize: "15px",
                  borderRadius: "6px",
                }}
              >
                {editId
                  ? "Update Data"
                  : "Add Data"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;