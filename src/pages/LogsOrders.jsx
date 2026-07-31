import { useState, useEffect, useCallback } from "react";
import "../styles/table.css";
import axios from "axios";

const LogsOrders = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const rowsPerPage = 8;

  const getToken = () => localStorage.getItem("adminToken");

  useEffect(() => {
    document.title = "Logs Orders - Admin RealSMS";
  }, []);

  const formatValue = (val) =>
    val && val.toString().trim() !== "" ? val : "-";

  /* ==============================
     FETCH LOG ORDERS
  ============================= */
  const fetchLogs = useCallback(async (page = 1, searchTerm = "") => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/log-orders`,
        {
          params: { page, limit: rowsPerPage, search: searchTerm },
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      setLogs(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch log orders error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(currentPage, search);
  }, [currentPage, search, fetchLogs]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  /* ==============================
     EXPORT CSV
  ============================= */
  const handleExport = () => {
    const csv = [
      ["User Email", "Date", "Platform", "Product", "Price", "Quantity", "Details"],
      ...logs.map((log) => [
        formatValue(log.user?.email),
        log.createdAt
          ? new Date(log.createdAt).toLocaleDateString()
          : "-",
        formatValue(log.platform),
        formatValue(log.product),
        `₦${log.price?.toLocaleString() || "0"}`,
        formatValue(log.quantity),
        formatValue(log.details),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "log-orders.csv";
    link.click();
  };

  const truncateText = (text, maxLength = 17) => {
  if (!text) return "-";
  return text.length > maxLength
    ? text.slice(0, maxLength) + "..."
    : text;
};

  return (
    <div className="table-page">
      <h1>Logs Orders</h1>

      <div className="table-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search platform, product, or user..."
          value={search}
          onChange={handleSearchChange}
        />

        <div className="buttons-right">
          <button className="btn btn-export" onClick={handleExport}>
            Export CSV
          </button>
        </div>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>User</th> 
            <th>Date</th>
            <th>Platform</th>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Details</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                Loading...
              </td>
            </tr>
          ) : logs.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No log orders found
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log._id}>
                {/* USER EMAIL */}
                <td data-label="User">
                  {formatValue(log.user)}
                </td>

                <td data-label="Date">
                  {log.createdAt
                    ? new Date(log.createdAt).toLocaleDateString()
                    : "-"}
                </td>

                <td data-label="Platform">
                  {formatValue(log.platform)}
                </td>

                <td data-label="Product" title={log.product}>
  {truncateText(formatValue(log.product), 17)}
</td>

                <td data-label="Price">
                  ₦{log.price?.toLocaleString() || "0"}
                </td>

                <td data-label="Quantity">
                  {formatValue(log.quantity)}
                </td>

                <td data-label="Details">
                  {log.details
                    ? log.details.length > 20
                      ? log.details.slice(0, 20) + "..."
                      : log.details
                    : "-"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <span className="current-page">{currentPage}</span>

        <button
          onClick={() =>
            setCurrentPage((p) => Math.min(totalPages, p + 1))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default LogsOrders;
