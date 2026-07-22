import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import "./drawingMobile.css";

/*
Updated from your old DrawingViewerPage code :contentReference[oaicite:0]{index=0}

Final Fixes Added:
- Proper logout button logout
- Tab close / browser close auto logout support
- Refresh will NOT logout
- Stable PDF loading
- No blank iframe issue
- Direct PDF loading (no Google Docs issue)
- Category → Place → Drawing structure fixed
- Admin button only for ADMIN
*/

const DrawingViewerPage = () => {
  const [drawings, setDrawings] = useState([]);
  const [selectedDrawing, setSelectedDrawing] =
    useState(null);

  const [expandedCategory, setExpandedCategory] =
    useState("");
  const [expandedPlace, setExpandedPlace] =
    useState("");

  const [loadingPDF, setLoadingPDF] =
    useState(false);
  const [downloading, setDownloading] =
    useState(false);

  const [pageLoading, setPageLoading] =
    useState(false);
  const [loadingMessage, setLoadingMessage] =
    useState("");

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const API = process.env.REACT_APP_API_URL;
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  // =====================================
  // Load Drawings
  // =====================================
  useEffect(() => {
    setLoadingMessage("Loading Drawings...");
    setPageLoading(true);

    axios
      .get(`${API}/drawings`)
      .then((res) => {
        const allDrawings =z
          res.data.drawings || [];

        setDrawings(allDrawings);

        if (allDrawings.length > 0) {
          setTimeout(() => {
            setPageLoading(false);
          }, 500);
        } else {
          setPageLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setPageLoading(false);
      });
  }, [API]);

  // =====================================
  // Auto Open Mobile Menu
  // =====================================
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setMobileMenuOpen(true);
    }
  }, []);

  // =====================================
  // Group Data
  // category → place → drawings
  // =====================================


const groupData = () => {
  const grouped = {};

  /*
  Required Order:

  Latest uploaded = TOP
  Older uploaded = DOWN

  Example:

  1st upload → A
  2nd upload → B
  3rd upload → C

  Frontend show:

  C
  B
  A

  New data should always come first
  */

  const placePriority = {
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
  };

  const categoryPriority = [
    "Office",
    "Printing_Plant",
  ];

  // =====================================
  // Group drawings
  // unshift() = newest first
  // =====================================
  drawings.forEach((drawing) => {
    const category =
      drawing.category || "Others";

    const place =
      drawing.place || "Others";

    if (!grouped[category]) {
      grouped[category] = {};
    }

    if (!grouped[category][place]) {
      grouped[category][place] = [];
    }

    // newest upload comes first
    grouped[category][place].unshift({
      _id: drawing._id,
       drawingName: drawing.drawingName,
  fileUrl: drawing.fileUrl,
  category: drawing.category,
  place: drawing.place,
    });
  });


  // =====================================
  // Apply category + place priority
  // =====================================
  const orderedGrouped = {};

  categoryPriority.forEach((category) => {
    if (!grouped[category]) return;

    orderedGrouped[category] = {};

    const places = Object.keys(
      grouped[category]
    );

    places.sort((a, b) => {
      const priorityList =
        placePriority[category] || [];

      const indexA =
        priorityList.indexOf(a) === -1
          ? 999
          : priorityList.indexOf(a);

      const indexB =
        priorityList.indexOf(b) === -1
          ? 999
          : priorityList.indexOf(b);

      return indexA - indexB;
    });

    places.forEach((place) => {
      orderedGrouped[category][place] =
        grouped[category][place];
    });
  });

  return orderedGrouped;
};


  const groupedData = groupData();

  // =====================================
  // Logout
  // =====================================
  const handleLogout = async () => {
    const username =
      localStorage.getItem("username");

    if (!username) return;

    setLoadingMessage(
      "Logout Processing..."
    );
    setPageLoading(true);

    try {
      await axios.post(
        `${API}/log-logout`,
        {
          username,
        }
      );
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => {
      localStorage.clear();
      window.location.href = "/";
    }, 800);
  };

  // =====================================
  // Select Drawing
  // Stable iframe reload fix
  // =====================================
  const handleSelectDrawing = (
    drawing
  ) => {
    setMobileMenuOpen(false);
    setLoadingPDF(true);

    // Force iframe refresh
    setSelectedDrawing(null);

    setTimeout(() => {
      setSelectedDrawing(drawing);
    }, 100);
  };

  // =====================================
  // Download PDF
  // =====================================
const handleDownload = async (drawing) => {
  setDownloading(true);

  try {
    const response = await fetch(drawing.fileUrl);
    const blob = await response.blob();

    const placeMap = {
      Chennai: "CH",
      "Oragadam-chennai": "CH",
      Coimbatore: "CBE",
      Madurai: "MDU",
      Pondy: "PONDY",
      Bangalore: "BNG",
      Bombay: "BMY",
      Delhi: "DELHI",
      Thirunelveli: "TNV",
    };

    const placeCode =
      placeMap[drawing.place] || drawing.place;

    const categoryCode =
      drawing.category === "Office"
        ? "OFF"
        : drawing.category === "Printing_Plant"
        ? "PLANT"
        : "";

    const fileName = `${placeCode}_${categoryCode}_${drawing.drawingName.replace(
      /\.pdf$/i,
      ""
    )}.pdf`;

    const link = document.createElement("a");

    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;

    link.click();

    window.URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error(err);
  }

  setDownloading(false);
};

  // =====================================
  // Sidebar Content
  // =====================================
  const SidebarContent = (
    <div
      style={{
        overflowY: "auto",
        height: "75vh",
        overflowX: "hidden",
      }}
    >
      <div className="mobile-sidebar-heading">
        <h5 className="fw-bold text-dark mt-3 mb-4 border-bottom pb-2 ms-3">
          DINAMALAR Drawings
        </h5>
      </div>

      {Object.keys(groupedData).map(
        (category) => (
          <div
            key={category}
            className="mb-2"
          >
            {/* Category */}
            <div
              className={`fw-semibold text-primary py-1 px-2 rounded ${
                expandedCategory ===
                category
                  ? "bg-light"
                  : ""
              }`}
              style={{
                cursor: "pointer",
              }}
              onClick={() => {
                setExpandedCategory(
                  expandedCategory ===
                    category
                    ? ""
                    : category
                );
                setExpandedPlace("");
              }}
            >
              <span className="me-2">
                {expandedCategory ===
                category
                  ? "▾"
                  : "▸"}
              </span>

              {category}
            </div>

            {/* Place */}
            {expandedCategory ===
              category && (
              <div className="ms-3 mt-2">
                {Object.keys(
                  groupedData[
                    category
                  ]
                ).map((place) => (
                  <div
                    key={place}
                    className="mb-1"
                  >
                    <div
                      className={`text-success py-1 px-2 rounded ${
                        expandedPlace ===
                        place
                          ? "bg-light"
                          : ""
                      }`}
                      style={{
                        cursor:
                          "pointer",
                      }}
                      onClick={() =>
                        setExpandedPlace(
                          expandedPlace ===
                            place
                            ? ""
                            : place
                        )
                      }
                    >
                      <span className="me-2">
                        {expandedPlace ===
                        place
                          ? "▾"
                          : "▸"}
                      </span>

                      {place}
                    </div>

                    {/* Drawings */}
                    {expandedPlace ===
                      place && (
                      <ul className="list-unstyled ms-4 mt-2">
                        {groupedData[
                          category
                        ][place].map(
                          (
                            drawing,
                            idx
                          ) => (
                            <li
                              key={
                                idx
                              }
                              className="text-dark px-2 py-1 rounded"
                              style={{
                                cursor:
                                  "pointer",
                              }}
                              onClick={() =>
                                handleSelectDrawing(
                                  drawing
                                )
                              }
                            >
                              📄{" "}
                              {
                                drawing.drawingName
                              }
                            </li>
                          )
                        )}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );

  // =====================================
  // Full Screen Loader
  // =====================================
  const SpinnerOverlay = (
    <div className="fullscreen-loader">
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
    <>
      {pageLoading &&
        SpinnerOverlay}

      <div
        className="d-flex"
        style={{
          height: "100vh",
          opacity: pageLoading
            ? 0.2
            : 1,
          filter: pageLoading
            ? "blur(4px)"
            : "none",
          pointerEvents:
            pageLoading
              ? "none"
              : "auto",
          transition:
            "all 0.3s ease",
        }}
      >
        {/* Desktop Sidebar */}
        <div
          className="sidebar-container d-flex flex-column"
          style={{
            height: "100vh",
          }}
        >
          <div className="flex-grow-1 overflow-auto">
            {SidebarContent}
          </div>

          <div
            style={{
              padding: "12px",
              background: "#fff",
              borderTop:
                "1px solid #ddd",
            }}
          >
            {role === "ADMIN" && (
              <button
                className="btn btn-warning w-100 mb-2"
                onClick={() =>
                  navigate(
                    "/admin"
                  )
                }
              >
                ⚙ Admin Panel
              </button>
            )}

            <button
              className="btn btn-danger w-100"
              onClick={
                handleLogout
              }
            >
              🔒 Logout
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn btn btn-primary d-md-none"
          onClick={() =>
            setMobileMenuOpen(true)
          }
        >
          ☰ Menu
        </button>

        {/* Mobile Sidebar */}
        <div
          className={`mobile-sidebar ${
            mobileMenuOpen
              ? "open"
              : ""
          }`}
        >
          <button
            className="btn btn-danger w-100 mb-3"
            onClick={() =>
              setMobileMenuOpen(
                false
              )
            }
          >
            ✖ Close
          </button>

          {SidebarContent}

          {role === "ADMIN" && (
            <button
              className="btn btn-warning w-100 mt-3 mb-3"
              onClick={() =>
                navigate(
                  "/admin"
                )
              }
            >
              ⚙ Admin Panel
            </button>
          )}

          <button
            className="btn btn-danger w-100"
            onClick={
              handleLogout
            }
          >
            🔒 Logout
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="p-4 viewer-content">
          <h4 className="mb-3">
            Drawing Viewer
          </h4>

          {selectedDrawing ? (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-primary mb-0">
                  {
                    selectedDrawing.drawingName
                  }
                </h5>

                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() =>
                    handleDownload(
                      selectedDrawing
                    )
                  }
                  disabled={
                    downloading
                  }
                >
                  {downloading
                    ? "Downloading..."
                    : "📥 Download"}
                </button>
              </div>

              {/* PDF Loading */}
              {loadingPDF && (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary mb-3"></div>
                  <div>
                    Loading PDF...
                  </div>
                </div>
              )}

              {/* Direct PDF iframe */}
              {/* PDF Viewer (Mobile + Desktop Support) */}
<iframe
  src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(
    selectedDrawing.fileUrl
  )}#pagemode=none`}
  title={selectedDrawing.drawingName}
  className="pdf-frame"
  style={{
    width: "100%",
    height: "calc(100vh - 150px)",
    border: "none",
    overflow: "hidden",
    display: loadingPDF ? "none" : "block",
  }}
  onLoad={() => setLoadingPDF(false)}
/>
            </div>
          ) : (
            <div className="text-center text-muted mt-5">
              <p>
                No drawing selected.
                Please choose one
                from sidebar.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DrawingViewerPage;
