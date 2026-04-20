import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
  const location = useLocation();

  // Close sidebar on desktop mode or when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 1024);
      if (window.innerWidth > 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-shell">
      {sidebarOpen && isDesktop === false && (
        <div className="sidebar-backdrop" onClick={closeSidebar} />
      )}
      <Sidebar isOpen={sidebarOpen} onCloseSidebar={closeSidebar} />
      <div className="app-main">
        <Header toggleSidebar={toggleSidebar} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
