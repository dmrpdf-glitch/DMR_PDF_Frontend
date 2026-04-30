import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const roles = ["MD", "ADMIN"];

const UserInsightsPage = () => {
  const [roleCounts, setRoleCounts] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [usersInRole, setUsersInRole] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLogs, setUserLogs] = useState([]);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const API = process.env.REACT_APP_BACKEND_URL;

  // Fetch role counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await axios.get(
          `${API}/user-counts`
        );

        setRoleCounts(res.data.counts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchCounts();
  }, [API]);

  // Fetch users by role
  useEffect(() => {
    if (selectedRole) {
      setLoadingUsers(true);

      axios
        .get(
          `${API}/users-by-role/${selectedRole}`
        )
        .then((res) =>
          setUsersInRole(res.data || [])
        )
        .catch((err) =>
          console.error(err)
        )
        .finally(() =>
          setLoadingUsers(false)
        );

      setSelectedUser(null);
      setUserLogs([]);
    }
  }, [selectedRole, API]);

  // Fetch user logs
  useEffect(() => {
    if (selectedUser) {
      setLoadingLogs(true);

      axios
        .get(
          `${API}/user-log-history/${selectedUser}`
        )
        .then((res) =>
          setUserLogs(res.data || [])
        )
        .catch((err) =>
          console.error(err)
        )
        .finally(() =>
          setLoadingLogs(false)
        );
    }
  }, [selectedUser, API]);

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleString();

const getDuration = (start, end) => {
  if (!end) return "Active";

  const diff = new Date(end) - new Date(start);

  const totalSeconds = Math.floor(diff / 1000);

  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  return `${hrs}h ${mins}m ${secs}s`;
};
  return (
    <div className="container py-4">

      {/* Full Page Loader */}
      {pageLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
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
            className="spinner-border text-primary mb-3"
            style={{
              width: "3rem",
              height: "3rem",
            }}
          ></div>

          <h4 className="fw-bold">
            Loading User Insights...
          </h4>
        </div>
      )}

      <h3 className="text-center mb-5 fw-bold">
        <i className="bi bi-graph-up-arrow me-2"></i>
        User Activity Insights
      </h3>

      <div className="row row-cols-1 row-cols-md-3 g-4">

        {/* Roles */}
        <div className="col">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white fw-bold">
              User Roles
            </div>

            <div className="card-body">
              <div className="list-group">

                {roles.map((role) => {
                  const found =
                    roleCounts.find(
                      (c) => c._id === role
                    );

                  const count =
                    found ? found.count : 0;

                  return (
                    <button
                      key={role}
                      className={`list-group-item list-group-item-action ${
                        selectedRole === role
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedRole(role)
                      }
                    >
                      {role} —{" "}
                      <strong>{count}</strong>
                    </button>
                  );
                })}

              </div>
            </div>
          </div>
        </div>

        {/* Users */}
        {selectedRole && (
          <div className="col">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-info text-white fw-bold">
                Users in {selectedRole}
              </div>

              <div className="card-body">

                {loadingUsers ? (
                  <div className="text-center">
                    <div className="spinner-border"></div>
                  </div>
                ) : (
                  <ul className="list-group">

                    {usersInRole.map((user) => (
                      <li
                        key={user._id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        {user.username}

                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() =>
                            setSelectedUser(
                              user.username
                            )
                          }
                        >
                          View Logs
                        </button>
                      </li>
                    ))}

                  </ul>
                )}

              </div>
            </div>
          </div>
        )}

        {/* Logs */}
        {selectedUser && (
          <div className="col">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-success text-white fw-bold">
                Logs for {selectedUser}
              </div>

              <div className="card-body">

                {loadingLogs ? (
                  <div className="text-center">
                    <div className="spinner-border"></div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered table-sm">

                      <thead>
                        <tr>
                          <th>Login</th>
                          <th>Logout</th>
                          <th>Duration</th>
                        </tr>
                      </thead>

                      <tbody>
                        {userLogs.length > 0 ? (
                          userLogs.map(
                            (log, index) => (
                              <tr key={index}>
                                <td>
                                  {formatTime(
                                    log.loginTime
                                  )}
                                </td>

                                <td>
                                  {log.logoutTime
                                    ? formatTime(
                                        log.logoutTime
                                      )
                                    : "Active"}
                                </td>

                                <td>
                                  {getDuration(
                                    log.loginTime,
                                    log.logoutTime
                                  )}
                                </td>
                              </tr>
                            )
                          )
                        ) : (
                          <tr>
                            <td
                              colSpan="3"
                              className="text-center"
                            >
                              No logs found
                            </td>
                          </tr>
                        )}
                      </tbody>

                    </table>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserInsightsPage;