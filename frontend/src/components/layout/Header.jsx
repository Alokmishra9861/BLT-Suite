import React from "react";
import { useAuth } from "../../hooks/useAuth.js";
import EntitySwitcher from "./EntitySwitcher.jsx";
import Breadcrumbs from "./Breadcrumbs.jsx";

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="hamburger"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <Breadcrumbs />
      </div>
      <div className="header-actions">
        <EntitySwitcher />
        <div className="user-chip">
          <span>{user?.name || "User"}</span>
          <button type="button" className="link-button" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
