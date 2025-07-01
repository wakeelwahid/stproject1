import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Transactions.css";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [showAll, setShowAll] = useState(false);

  // Status highlight helper
  const getStatusClass = (status) => {
    if (!status) return "";
    const s = status.toLowerCase();
    if (s === "pending") return "status-pending";
    if (s === "approved" || s === "completed") return "status-approved";
    if (s === "rejected") return "status-rejected";
    return "";
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://127.0.0.1:8000/api/transactions/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const formatted = res.data.map((tx, index) => {
          let dateObj = null;
          if (tx.created_at) {
            const [datePart, timePart] = tx.created_at.split(" ");
            const [day, month, year] = datePart.split("-");
            let [hour, minute] = timePart.split(":");
            let ampm = tx.created_at.slice(-2);
            hour = parseInt(hour, 10);
            if (ampm === "PM" && hour < 12) hour += 12;
            if (ampm === "AM" && hour === 12) hour = 0;
            dateObj = new Date(
              `${year}-${month}-${day}T${hour.toString().padStart(2, "0")}:${minute}:00`
            );
          }
          return {
            id: index + 1,
            dateObj,
            date: dateObj
              ? dateObj.toLocaleDateString("en-IN")
              : tx.created_at || "",
            time: dateObj
              ? dateObj.toLocaleTimeString("en-IN")
              : "",
            type: tx.type,
            amount:
              (tx.type === "deposit" ||
              tx.type === "win" ||
              tx.type === "bonus"
                ? "+"
                : "-") + `₹${tx.amount}`,
            status: tx.status
              ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1)
              : "Completed",
          };
        });

        setTransactions(formatted);
      } catch (error) {
        console.error("Failed to load transactions", error);
      }
    };

    fetchTransactions();
  }, []);

  // Show only last 15 transactions by default
  const filteredTransactions = showAll
    ? transactions
    : transactions.slice(0, 15);

  return (
    <div className="transactions-container">
      <div className="transactions-content">
      
        <div className="transaction-card">
          <h2 className="card-title">Transactions History</h2>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search transactions..."
              className="search-input"
            />
            <button
              className="show-all-btn"
              style={{ marginLeft: "10px" }}
              onClick={() => setShowAll((prev) => !prev)}
            >
              {showAll ? "Show Last 15" : "Show All"}
            </button>
          </div>
          <div className="table-container" style={{ maxHeight: "350px", overflowY: "auto" }}>
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Date/Time</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      {transaction.date} / <span>{transaction.time}</span>
                    </td>
                    <td>{transaction.type}</td>
                    <td>{transaction.amount}</td>
                    <td>
                      <span className={getStatusClass(transaction.status)}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center" }}>
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;