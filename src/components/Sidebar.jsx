import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FiUpload,
  FiHome,
  FiMail,
  FiUsers,
  FiClock,
  FiPlusCircle,
  FiHeadphones,
  FiDatabase,
} from "react-icons/fi";
import "../styles/sidebar.css";
import logo from "../assets/logo.png";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const getToken = () => localStorage.getItem("adminToken");

  /* ==============================
     Detect Mobile Screen
  ============================== */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener("resize", handleResize);
  }, []);

  /* ==============================
   Fetch Sidebar Counts
============================== */
useEffect(() => {
  const fetchSidebarCounts = async () => {
    // Stop polling when tab isn't visible
    if (document.hidden) return;

    try {
      const token = getToken();

      const [txRes, msgRes] = await Promise.all([
        fetch(
          `${process.env.REACT_APP_API_URL}/api/admin/transactions/pending-count`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),
        fetch(
          `${process.env.REACT_APP_API_URL}/api/support/admin/unread`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),
      ]);

      if (txRes.ok) {
        const txData = await txRes.json();
        setPendingCount(txData.pendingCount || 0);
      }

      if (msgRes.ok) {
        const msgData = await msgRes.json();

        setUnreadMessages(
          Array.isArray(msgData)
            ? msgData.length
            : msgData?.data?.length || 0
        );
      }
    } catch (error) {
      console.error("Sidebar fetch error:", error);
    }
  };

  fetchSidebarCounts();

  // Changed from 30s → 2 minutes
  const interval = setInterval(fetchSidebarCounts, 120000);

  return () => clearInterval(interval);
}, []);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && isMobile && (
        <div
          className="sidebar-overlay"
          onClick={toggleSidebar}
        ></div>
      )}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Close Button */}
        <div className="close-btn" onClick={toggleSidebar}>
          &times;
        </div>

        {/* Logo */}
        <div className="sidebar-logo">
          <img src={logo} alt="RealSMS Admin" />
        </div>

        {/* Navigation */}
        <nav>
          <NavLink to="/admin" end onClick={toggleSidebar}>
            <FiHome className="sidebar-icon" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/admin/users" onClick={toggleSidebar}>
            <FiUsers className="sidebar-icon" />
            <span>Users</span>
          </NavLink>

          <NavLink
            to="/admin/transactions"
            onClick={toggleSidebar}
            className="nav-with-badge"
          >
            <FiClock className="sidebar-icon" />
            <span>Transactions</span>

            {pendingCount > 0 && (
              <span className="badge pulse">
                {pendingCount}
              </span>
            )}
          </NavLink>

          <NavLink to="/admin/orders" onClick={toggleSidebar}>
            <FiPlusCircle className="sidebar-icon" />
            <span>Number Orders</span>
          </NavLink>

           <NavLink to="/admin/logs-orders" onClick={toggleSidebar}>
            <FiPlusCircle className="sidebar-icon" />
            <span>Logs Orders</span>
          </NavLink>

         <NavLink to="/admin/logs-manager" onClick={toggleSidebar}>
            <FiDatabase className="sidebar-icon" />
            <span>Logs Manager</span>
          </NavLink>

           <NavLink to="/admin/email-broadcast" onClick={toggleSidebar}>
            <FiMail className="sidebar-icon" />
            <span>Email Broadcast</span>
          </NavLink>

           <NavLink to="/admin/upload-tutorial" onClick={toggleSidebar}>
            <FiUpload className="sidebar-icon" />
            <span>Upload Tutorials</span>
          </NavLink>
          
          <NavLink
            to="/admin/support"
            onClick={toggleSidebar}
            className="nav-with-badge"
          >
            <FiHeadphones className="sidebar-icon" />
            <span>Support</span>

            {unreadMessages > 0 && (
              <span className="badge unread pulse">
                {unreadMessages}
              </span>
            )}
          </NavLink>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;


