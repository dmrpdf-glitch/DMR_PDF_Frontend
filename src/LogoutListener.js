import { useEffect } from "react";
import axios from "axios";

const LogoutListener = () => {
  useEffect(() => {
    let inactivityTimer;

    // ✅ ENV with fallback safety
    const API = process.env.REACT_APP_API_URL || "";

    /*
    =====================================
    Detect refresh
    =====================================
    */
    const handleBeforeUnload = () => {
      sessionStorage.setItem("isRefreshing", "true");
    };

    /*
    =====================================
    Clear refresh flag after load
    =====================================
    */
    const handleLoad = () => {
      sessionStorage.removeItem("isRefreshing");
    };

    /*
    =====================================
    10 min inactivity auto logout
    =====================================
    */
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);

      inactivityTimer = setTimeout(async () => {
        const username = localStorage.getItem("username");

        // ❗ Safety check
        if (!username || !API) return;

        try {
          await axios.post(`${API}/log-logout`, {
            username,
            reason: "inactive-10min",
          });

          localStorage.clear();
          alert("Session expired due to inactivity");
          window.location.href = "/";
        } catch (err) {
          console.error("Auto logout error:", err);
        }
      }, 10 * 60 * 1000); // 10 minutes
    };

    /*
    =====================================
    Send logout using sendBeacon
    =====================================
    */
    const saveLogout = () => {
      const username = localStorage.getItem("username");

      // ❗ Safety check
      if (!username || !API) return;

      // prevent duplicate calls
      if (sessionStorage.getItem("logoutSaved")) return;

      sessionStorage.setItem("logoutSaved", "true");

      const payload = new Blob(
        [
          JSON.stringify({
            username,
            reason: "browser-close",
          }),
        ],
        { type: "application/json" }
      );

      navigator.sendBeacon(`${API}/log-logout`, payload);
    };

    /*
    =====================================
    Detect tab close / browser close
    =====================================
    */
    const handlePageHide = () => {
      const isRefreshing = sessionStorage.getItem("isRefreshing");

      // ❌ skip refresh
      if (isRefreshing === "true") {
        sessionStorage.removeItem("isRefreshing");
        return;
      }

      // ✅ real close
      saveLogout();
    };

    /*
    =====================================
    Activity listeners
    =====================================
    */
    window.addEventListener("mousemove", resetInactivityTimer);
    window.addEventListener("keydown", resetInactivityTimer);
    window.addEventListener("click", resetInactivityTimer);
    window.addEventListener("scroll", resetInactivityTimer);

    /*
    Lifecycle listeners
    */
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("load", handleLoad);
    window.addEventListener("pagehide", handlePageHide);

    // start timer
    resetInactivityTimer();

    /*
    =====================================
    Cleanup
    =====================================
    */
    return () => {
      clearTimeout(inactivityTimer);

      window.removeEventListener("mousemove", resetInactivityTimer);
      window.removeEventListener("keydown", resetInactivityTimer);
      window.removeEventListener("click", resetInactivityTimer);
      window.removeEventListener("scroll", resetInactivityTimer);

      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("load", handleLoad);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  return null;
};

export default LogoutListener;