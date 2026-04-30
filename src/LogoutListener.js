import { useEffect } from "react";
import axios from "axios";

const LogoutListener = () => {
  useEffect(() => {
    let inactivityTimer;

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
        if (!username) return;

        try {
          await axios.post(
            "http://localhost:5000/api/log-logout",
            {
              username,
              reason: "inactive-10min",
            }
          );

          localStorage.clear();
          alert("Session expired due to inactivity");
          window.location.href = "/";
        } catch (err) {
          console.error("Auto logout error:", err);
        }
      }, 10 * 60 * 1000);
    };

    /*
    =====================================
    Send logout using sendBeacon
    =====================================
    */
    const saveLogout = () => {
      const username = localStorage.getItem("username");
      if (!username) return;

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
        { type: "text/plain" }
      );

      navigator.sendBeacon(
        "http://localhost:5000/api/log-logout",
        payload
      );
    };

    /*
    =====================================
    Detect tab close / browser close
    (MOST RELIABLE EVENT)
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