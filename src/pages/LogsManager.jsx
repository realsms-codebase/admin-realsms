import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/table.css";

// platform icons
import facebookIcon from "../assets/facebook.png";
import twitterIcon from "../assets/twitter.png";
import netflixIcon from "../assets/netflix.png";
import textingIcon from "../assets/texting.png";
import vpnIcon from "../assets/vpn.png";

const API = process.env.REACT_APP_API_URL;

const platformIcons = {
  Facebook: facebookIcon,
  Twitter: twitterIcon,
  "Twitter (X)": twitterIcon,
  Netflix: netflixIcon,
  VPN: vpnIcon,
  "Texting Apps": textingIcon,
};

const AdminLogs = () => {
  const [form, setForm] = useState({
    platform: "",
    name: "",
    price: "",
    stock: 0,
    type: "",
    details: [],
  });

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetails, setShowDetails] = useState({});
  const [editingLog, setEditingLog] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const logsPerPage = 10;
  const adminToken = localStorage.getItem("adminToken"); // admin JWT

  useEffect(() => {
    document.title = "Logs Manager - Admin RealSMS";
    fetchLogs();

    const interval = setInterval(() => {
      fetchLogs(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const res = await axios.get(`${API}/api/log`);

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.logs || res.data.data || [];

      setLogs(data);
    } catch (err) {
      console.error(err);
      setLogs([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // Admin axios config
  const adminConfig = {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  };

  const formatValue = (val) =>
    val && val.toString().trim() !== "" ? val : "-";

  const truncateText = (text, maxLength = 25) => {
    if (!text) return "-";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const detailsArray = content
        .split(/\r?\n/)
        .filter((line) => line.trim() !== "");

      setForm((prev) => ({
        ...prev,
        details: detailsArray,
        stock: detailsArray.length,
      }));
    };
    reader.readAsText(file);
  };

  const handleAddLog = async () => {
    if (!form.platform || !form.name || !form.price || form.details.length === 0) {
      return alert("Fill all required fields and upload a details file");
    }

    try {
      const res = await axios.post(
        `${API}/api/log`,
        { ...form, details: form.details.join("\n"), stock: form.details.length },
        adminConfig
      );

      setLogs((prev) => [res.data, ...prev]);

      setForm({
        platform: "",
        name: "",
        price: "",
        stock: 0,
        type: "",
        details: [],
      });
    } catch (err) {
      if (err.response?.status === 401) alert("Unauthorized: Please login as admin");
      else if (err.response?.status === 403) alert("Forbidden: Admin access required");
      else alert("Upload failed");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this log?")) return;

    try {
      await axios.delete(`${API}/api/log/${id}`, adminConfig);
      setLogs((prev) => prev.filter((log) => log._id !== id));
    } catch (err) {
      if (err.response?.status === 401) alert("Unauthorized: Please login as admin");
      else if (err.response?.status === 403) alert("Forbidden: Admin access required");
      else alert("Delete failed");
      console.error(err);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  const toggleDetails = (id) => {
    setShowDetails((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleEdit = (log) => {
    setEditingLog(log);
    setForm({
      platform: log.platform,
      name: log.name,
      price: log.price,
      stock: log.stock,
      type: log.type || "",
      details: log.details ? log.details.split("\n") : [],
    });
    setShowEditModal(true);
  };

  const handleUpdateLog = async () => {
    if (!editingLog) return;

    try {
      const res = await axios.put(
        `${API}/api/log/${editingLog._id}`,
        { ...form, details: form.details.join("\n"), stock: form.details.length },
        adminConfig
      );

      setLogs((prev) =>
        prev.map((log) => (log._id === editingLog._id ? res.data : log))
      );

      setShowEditModal(false);
      setEditingLog(null);

      setForm({
        platform: "",
        name: "",
        price: 0,
        stock: 0,
        type: "",
        details: [],
      });
    } catch (err) {
      if (err.response?.status === 401) alert("Unauthorized: Please login as admin");
      else if (err.response?.status === 403) alert("Forbidden: Admin access required");
      else alert("Update failed");
      console.error(err);
    }
  };

  const filteredLogs = logs.filter((log) =>
  (log.name || "").toLowerCase().includes(search.toLowerCase()) ||
  (log.platform || "").toLowerCase().includes(search.toLowerCase())
);

  const indexOfLast = currentPage * logsPerPage;
  const indexOfFirst = indexOfLast - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

   return (
    <div className="table-page">
      <h1>Logs Manager</h1>

      <input
        type="text"
        placeholder="Search logs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <div className="logs-table-controls">
        <select name="platform" value={form.platform} onChange={handleChange}>
          <option value="Facebook">Facebook</option>
          <option value="Twitter (X)">Twitter (X)</option> 
          <option value="Netflix">Netflix</option>
          <option value="VPN">VPN</option>
          <option value="Texting Apps">Texting Apps</option>    
        </select>

        <input
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
        />

        {/* ✅ OPTIONAL */}
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="">Type (Optional)</option>
          <option value="Aged">Aged</option>
          <option value="Dating">Dating</option>
          <option value="Followers">Followers</option>
          <option value="Softreg">Softreg</option>
          <option value="PVA">PVA</option>
          <option value="Verified">Verified</option>
        </select>

        <div className="file-upload-wrapper">
          <input
            type="file"
            id="fileUpload"
            accept=".txt,.csv"
            onChange={handleFileUpload}
            className="file-input"
          />
          <label htmlFor="fileUpload" className="file-label">
            Choose File
          </label>
          <span className="file-name">
            {form.details.length > 0
              ? `${form.details.length} lines uploaded`
              : "No file chosen"}
          </span>
        </div>

        <button className="logs-btn" onClick={handleAddLog}>
          Upload
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Platform</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Type</th>
            <th>Details</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>
                Loading...
              </td>
            </tr>
          ) : currentLogs.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>
                No logs found
              </td>
            </tr>
          ) : (
            currentLogs.map((log) => (
              <tr key={log._id}>
                <td data-label="Platform" className="platform-cell">
                  <img
                   src={platformIcons[log.platform] || facebookIcon}
                    alt={log.platform}
                    className="platform-icon"
                  />
                  <span>{log.platform}</span>
                </td>

                <td data-label="Name" title={log.name}>
                  {truncateText(log.name, 25)}
                </td>

                <td data-label="Price">
                  ₦{Number(log.price).toLocaleString()}
                </td>

                <td data-label="Stock">
                  <span style={{ color: log.stock < 5 ? "red" : "inherit" }}>
                    {formatValue(log.stock)}
                  </span>
                </td>

                <td data-label="Type">
                  <span
                    className={`status-badge ${
                      log.type ? log.type.toLowerCase() : "na"
                    }`}
                  >
                    {log.type || "N/A"}
                  </span>
                </td>

                <td data-label="Details">
                  <div className="details-cell">
                    <span title={log.details}>
                      {showDetails[log._id]
                        ? truncateText(log.details, 40)
                        : "••••••••••"}
                    </span>

                    <div className="button-group">
                      <button
                        className="toggle-btn"
                        onClick={() => toggleDetails(log._id)}
                      >
                        {showDetails[log._id] ? "Hide" : "Show"}
                      </button>

                      <button
                        className="copy-btn"
                        onClick={() => handleCopy(log.details)}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </td>

                <td data-label="Date">
                  {new Date(log.createdAt).toLocaleDateString()}
                </td>

                <td data-label="Action">
                  <div className="action-buttons">
                    <button
                      className="btn btn-edit"
                      onClick={() => handleEdit(log)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-delete"
                      onClick={() => handleDelete(log._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Prev
        </button>

        <span>
          {currentPage} / {totalPages || 1}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Log</h2>

            <select name="platform" value={form.platform} onChange={handleChange}>
              <option value="">Platform</option>
              <option value="Facebook">Facebook</option>
              <option value="Twitter (X)">Twitter (X)</option>
              <option value="Netflix">Netflix</option>
              <option value="VPN">VPN</option>
              <option value="Texting Apps">Texting Apps</option>  
            </select>

            <input name="name" value={form.name} onChange={handleChange} />

            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
            />

            <select name="type" value={form.type} onChange={handleChange}>
              <option value="">Type (Optional)</option>
              <option value="Aged">Aged</option>
              <option value="PVA">PVA</option>
              <option value="Verified">Verified</option>
            </select>

            <textarea
              rows={6}
              value={form.details.join("\n")}
              onChange={(e) => {
                const arr = e.target.value.split("\n");
                setForm({
                  ...form,
                  details: arr,
                  stock: arr.length,
                });
              }}
            />

            <input type="file" accept=".txt,.csv" onChange={handleFileUpload} />

            <div className="modal-actions">
              <button onClick={handleUpdateLog}>Update</button>
              <button onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogs;
