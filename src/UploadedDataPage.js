import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./UploadedDataPage.css";

/*
DMR Final UploadedDataPage
Correct Structure:

Office
  -> Chennai
  -> Madurai
  -> Pondy
  -> Coimbatore
  -> Bangalore
  -> Bombay
  -> Delhi

Printing_Plant
  -> Oragadam-chennai
  -> Madurai
  -> Pondy
  -> Coimbatore
  -> Thirunelveli

Backend Fields:
- location
- category
- place
- drawingName
- fileUrl
- publicId
*/

const locationMap = {
  DMR: {
    Office: [
      "Chennai",
      "Madurai",
      "Pondy",
      "Coimbatore",
      "Bangalore",
      "Bombay",
      "Delhi",
    ],

    Printing_Plant: [
      "Oragadam-chennai",
      "Madurai",
      "Pondy",
      "Coimbatore",
      "Thirunelveli",
    ],
  },
};

const UploadedDataPage = () => {
  const [uploadedDrawings, setUploadedDrawings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const navigate = useNavigate();
  const API = process.env.REACT_APP_BACKEND_URL;

  // =====================================
  // Fetch Drawings
  // =====================================
  useEffect(() => {
    const fetchDrawings = async () => {
      try {
        setLoading(true);
        setLoadingMessage("Loading Uploaded Drawings...");

        const res = await axios.get(`${API}/drawings`);
        setUploadedDrawings(res.data.drawings || []);

        setTimeout(() => {
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error(error);
        alert("⚠️ Failed to load drawings");
        setLoading(false);
      }
    };

    fetchDrawings();
  }, [API]);

  // =====================================
  // Delete Drawing
  // =====================================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this drawing?"
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);
      setLoadingMessage("Deleting Drawing...");

      await axios.delete(`${API}/drawing/${id}`);

      setUploadedDrawings((prev) =>
        prev.filter((drawing) => drawing._id !== id)
      );

      alert("✅ Drawing deleted successfully");

      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error(error);
      alert("⚠️ Failed to delete drawing");
      setLoading(false);
    }
  };

  // =====================================
  // Edit Drawing
  // =====================================
  const handleEdit = (drawing) => {
    localStorage.setItem(
      "editDrawing",
      JSON.stringify(drawing)
    );

    navigate("/admin?edit=true");
  };

  // =====================================
  // Place Options
  // =====================================
  const placeOptions =
    selectedCategory &&
    locationMap.DMR[selectedCategory]
      ? locationMap.DMR[selectedCategory]
      : [];

  // =====================================
  // Filter Drawings
  // =====================================
  const filteredDrawings = uploadedDrawings.filter(
    (drawing) => {
      const categoryMatch =
        !selectedCategory ||
        drawing.category === selectedCategory;

      const placeMatch =
        !selectedPlace ||
        drawing.place === selectedPlace;

      return categoryMatch && placeMatch;
    }
  );

  // =====================================
  // Fullscreen Spinner
  // =====================================
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
    <div className="container mt-4">

      {loading && SpinnerOverlay}

      {/* Heading */}
      <h3 className="text-center text-primary fw-bold mb-4">
        <i className="bi bi-folder2-open me-2"></i>
        Uploaded Drawings (DMR)
      </h3>

      {/* Category Filter */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body">

          <label className="form-label fw-bold me-3 text-secondary">
            Category:
          </label>

          {Object.keys(locationMap.DMR).map((category) => (
            <div
              className="form-check form-check-inline"
              key={category}
            >
              <input
                type="radio"
                className="form-check-input"
                id={`cat-${category}`}
                name="category"
                value={category}
                checked={selectedCategory === category}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedPlace("");
                }}
              />

              <label
                className="form-check-label fw-semibold"
                htmlFor={`cat-${category}`}
              >
                {category}
              </label>
            </div>
          ))}

          <button
            className="btn btn-sm btn-outline-secondary ms-3"
            onClick={() => {
              setSelectedCategory("");
              setSelectedPlace("");
            }}
          >
            <i className="bi bi-x-circle me-1"></i>
            Clear
          </button>

        </div>
      </div>

      {/* Place Filter */}
      {selectedCategory && placeOptions.length > 0 && (
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">

            <label className="form-label fw-bold me-3 text-secondary">
              Place:
            </label>

            {placeOptions.map((place) => (
              <div
                className="form-check form-check-inline"
                key={place}
              >
                <input
                  type="radio"
                  className="form-check-input"
                  id={`place-${place}`}
                  name="place"
                  value={place}
                  checked={selectedPlace === place}
                  onChange={(e) =>
                    setSelectedPlace(e.target.value)
                  }
                />

                <label
                  className="form-check-label fw-semibold"
                  htmlFor={`place-${place}`}
                >
                  {place}
                </label>
              </div>
            ))}

            <button
              className="btn btn-sm btn-outline-secondary ms-3"
              onClick={() => setSelectedPlace("")}
            >
              <i className="bi bi-x-circle me-1"></i>
              Clear
            </button>

          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-responsive shadow-sm">
        <table className="table table-bordered table-hover align-middle">

          <thead className="table-primary text-center">
            <tr>
              <th>#</th>
              <th>Category</th>
              <th>Place</th>
              <th>Drawing Name</th>
              <th>File</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredDrawings.length > 0 ? (
              filteredDrawings.map((drawing, index) => (
                <tr key={drawing._id}>
                  <td className="text-center">
                    {index + 1}
                  </td>

                  <td>
                    {drawing.category || "-"}
                  </td>

                  <td>
                    {drawing.place || "-"}
                  </td>

                  <td>
                    {drawing.drawingName}
                  </td>

                  <td className="text-center">
                    <a
                      href={drawing.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-info"
                    >
                      <i className="bi bi-file-earmark-pdf me-1"></i>
                      View
                    </a>
                  </td>

                  <td className="text-center">
                    <div className="d-flex flex-column flex-md-row justify-content-center gap-2">

                      <button
                        className="btn btn-sm btn-primary action-btn"
                        onClick={() => handleEdit(drawing)}
                      >
                        <i className="bi bi-pencil-square me-1"></i>
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-danger action-btn"
                        onClick={() =>
                          handleDelete(drawing._id)
                        }
                      >
                        <i className="bi bi-trash3 me-1"></i>
                        Delete
                      </button>

                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center text-muted py-4"
                >
                  No drawings found
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

    </div>
  );
};

export default UploadedDataPage;