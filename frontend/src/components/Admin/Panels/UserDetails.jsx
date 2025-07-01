import React, { useEffect, useState } from "react";
import adminAxios from "../../utils/adminAxios";
import { useParams } from "react-router-dom";
import "./panels.css";

const UserDetails = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gameFilter, setGameFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [wasReset, setWasReset] = useState(false);
  const [backupData, setBackupData] = useState(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFields, setEditFields] = useState({
    mobile: "",
    email: "",
    total_winning: "",
    total_wallet: "",
  });

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, [userId]);

  const fetchAll = async () => {
    setLoading(true);
    setStatusMsg("");
    setBackupData(null);
    try {
      const userRes = await adminAxios.get(`admin/user/${userId}/details/`);
      setUser(userRes.data);

      const depRes = await adminAxios.get(`admin/user/${userId}/deposits/`);
      setDeposits(depRes.data);

      const withRes = await adminAxios.get(`admin/user/${userId}/withdrawals/`);
      setWithdrawals(withRes.data);

      const betRes = await adminAxios.get(
        `admin/user/${userId}/bets/?months=2`
      );
      setBets(betRes.data);

      if (
        betRes.data.length === 0 &&
        depRes.data.length === 0 &&
        withRes.data.length === 0
      ) {
        setWasReset(true);
      } else {
        setWasReset(false);
      }
    } catch (err) {
      setStatusMsg("Failed to load user data.");
    }
    setLoading(false);
  };

  // Edit handlers
  const handleEditUser = () => {
    setEditFields({
      mobile: user.mobile || "",
      email: user.email || "",
      total_winning: user.total_winning || "",
      total_wallet: user.total_wallet || "",
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    setEditFields({ ...editFields, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async () => {
    setActionLoading(true);
    setStatusMsg("");
    try {
      await adminAxios.post(`/admin/user/${user.id}/edit/`, {
        mobile: editFields.mobile,
        email: editFields.email,
        total_winning: editFields.total_winning,
        total_wallet: editFields.total_wallet,
      });
      setStatusMsg("User updated successfully.");
      setShowEditModal(false);
      await fetchAll();
    } catch (err) {
      setStatusMsg("Failed to update user.");
    }
    setActionLoading(false);
  };

  // Group array by date (for colored date rows)
  const groupByDate = (arr) => {
    return arr.reduce((acc, item) => {
      const date = new Date(item.created_at).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {});
  };

  // Color palette for date rows
  const dateColors = [
    "#2e2e4d", "#34345c", "#39396b", "#40407a", "#474789", "#4e4e98"
  ];

  const handleBlockUser = async () => {
    if (!user) return;
    setActionLoading(true);
    setStatusMsg("");
    try {
      const newStatus = user.status === "active" ? "blocked" : "active";
      await adminAxios.post(`/admin/user/${user.id}/block/`, {
        status: newStatus,
      });
      setUser((prev) => ({ ...prev, status: newStatus }));
      await fetchAll();
      setStatusMsg(
        newStatus === "blocked"
          ? "User has been blocked."
          : "User has been unblocked."
      );
    } catch (err) {
      setStatusMsg("Failed to update user status.");
    }
    setActionLoading(false);
  };

  const handleResetUser = async () => {
    if (!window.confirm("Are you sure you want to reset all user data?"))
      return;
    setActionLoading(true);
    setStatusMsg("");
    try {
      await adminAxios.post(`/admin/user/${user.id}/reset/`);
      setWasReset(true);
      setStatusMsg("User data reset ho gaya. Ab Undo Reset kar sakte ho.");
      await fetchAll();
    } catch (err) {
      setStatusMsg("Failed to reset user data.");
    }
    setActionLoading(false);
  };

  const handleUndoReset = async (userId) => {
    setActionLoading(true);
    setStatusMsg("");
    try {
      const res = await fetch(`/api/admin/undo_reset_user/${userId}/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.success) {
        setWasReset(false);
        setStatusMsg("User data successfully restore ho gaya.");
        await fetchAll();
      } else {
        setStatusMsg(data.msg || "Undo reset failed.");
      }
    } catch (err) {
      setStatusMsg("Failed to undo reset.");
    }
    setActionLoading(false);
  };

  // Admin can view backup data after reset
  const handleViewBackup = async () => {
    setActionLoading(true);
    setStatusMsg("");
    try {
      const res = await fetch(`/api/admin/user_backup/${userId}/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.success && data.backup) {
        setBackupData(data.backup);
      } else {
        setStatusMsg("No backup data found.");
      }
    } catch (err) {
      setStatusMsg("Failed to fetch backup data.");
    }
    setActionLoading(false);
  };

  if (loading) return <div className="st-panel st-loading">Loading...</div>;
  if (!user) return <div className="st-panel st-error">User not found</div>;

  const formatDate = (dt) => new Date(dt).toLocaleString();
  const uniqueGames = Array.from(new Set(bets.map((b) => b.game_name))).filter(
    Boolean
  );
  const filteredBets =
    gameFilter === "all"
      ? bets
      : bets.filter((b) => b.game_name === gameFilter);
  const gameWiseTotals = {};
  bets.forEach((b) => {
    if (!gameWiseTotals[b.game_name]) gameWiseTotals[b.game_name] = 0;
    gameWiseTotals[b.game_name] += Number(b.amount);
  });

  return (
    <div className="st-panel">
      <div className="st-header">
        <h2 className="st-title">
          Name : {user.username} (ID: {user.id}){" "}
          <span className={`st-status-badge st-${user.status}`}>
            {user.status === "active" ? "Active" : "Blocked"}
          </span>
        </h2>
        <div className="st-actions">
          <button
            className={`st-action-btn ${
              user.status === "active" ? "st-block-btn" : "st-unblock-btn"
            }`}
            onClick={handleBlockUser}
            disabled={actionLoading}
          >
            {user.status === "active" ? "Block User" : "Unblock User"}
          </button>
          {!wasReset ? (
            <button
              className="st-action-btn st-reset-btn"
              onClick={handleResetUser}
              disabled={actionLoading}
            >
              Reset User
            </button>
          ) : (
            <>
              <button
                className="st-action-btn st-undoreset-btn"
                onClick={() => handleUndoReset(user.id)}
                disabled={actionLoading}
              >
                Undo Reset
              </button>
              <button
                className="st-action-btn st-viewreset-btn"
                onClick={handleViewBackup}
                disabled={actionLoading}
                style={{ marginLeft: 8 }}
              >
                View Reset Data
              </button>
            </>
          )}
          <button
            className="st-action-btn st-edit-btn"
            onClick={handleEditUser}
            disabled={actionLoading}
          >
            Edit user
          </button>
          <span className="st-status-display">
            <b>Status:</b>{" "}
            <span className={`st-status-badge st-${user.status}`}>
              {user.status === "active" ? "Active" : "Blocked"}
            </span>
          </span>
        </div>
        {statusMsg && (
          <div
            className="st-status-message"
            style={{ marginTop: 10, color: "#007bff" }}
          >
            {statusMsg}
          </div>
        )}
      </div>

      {backupData && (
        <div className="st-viewsection">
          <h3>Backup Data (Reset ke baad):</h3>
          <pre style={{ maxHeight: 300, overflow: "auto", fontSize: 13 }}>
            {JSON.stringify(backupData, null, 2)}
          </pre>
        </div>
      )}

      <div className="st-user-details">
        <div className="st-detail-row">
          <span className="st-detail-label">Mobile:</span>
          <span className="st-detail-value">{user.mobile}</span>
        </div>
        <div className="st-detail-row">
          <span className="st-detail-label">Email:</span>
          <span className="st-detail-value">{user.email}</span>
        </div>
        <div className="st-detail-row">
          <span className="st-detail-label">Referral Code:</span>
          <span className="st-detail-value">{user.referral_code}</span>
        </div>
        <div className="st-detail-row">
          <span className="st-detail-label">Date Joined:</span>
          <span className="st-detail-value">
            {formatDate(user.date_joined)}
          </span>
        </div>
        <div className="st-detail-row st-highlight">
          <span className="st-detail-label">Total Commission Earned:</span>
          <span className="st-detail-value">
            ₹
            {typeof user.commission_earned !== "undefined"
              ? user.commission_earned
              : 0}
          </span>
        </div>
        <div className="st-detail-row st-highlight">
          <span className="st-detail-label">Total Direct Bonus:</span>
          <span className="st-detail-value">₹{user.direct_bonus}</span>
        </div>
        <div className="st-detail-row st-highlight">
          <span className="st-detail-label">Total Earning:</span>
          <span className="st-detail-value">₹{user.total_earning}</span>
        </div>
        <div className="st-detail-row st-highlight">
          <span className="st-detail-label">Total Winning Amount:</span>
          <span className="st-detail-value">₹{user.total_winning}</span>
        </div>
        <div className="st-detail-row st-highlight">
          <span className="st-detail-label">Main Balance:</span>
          <span className="st-detail-value">₹{user.total_wallet}</span>
        </div>
      </div>

      <div className="st-section">
        <h3 className="st-section-title">Deposit History</h3>
        <div className="st-table-container">
          <table className="st-data-table">
            <thead>
              <tr>
                <th>Date/Time</th>
                <th>Amount</th>
                <th>Status</th>
                <th>UTR/Txn ID</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupByDate(deposits)).map(([date, items], idx) => (
                <React.Fragment key={date}>
                  <tr style={{ background: dateColors[idx % dateColors.length], color: "#fff" }}>
                    <td colSpan={4} style={{ fontWeight: 600 }}>{date}</td>
                  </tr>
                  {items.map((dep) => (
                    <tr key={dep.id}>
                      <td>{formatDate(dep.created_at)}</td>
                      <td className="st-amount">₹{dep.amount}</td>
                      <td>
                        <span className={`st-status-badge st-${dep.status.toLowerCase()}`}>
                          {dep.status}
                        </span>
                      </td>
                      <td className="st-utr">{dep.utr}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="st-total">
          <span className="st-total-label">Total Deposited:</span>
          <span className="st-total-value">
            ₹
            {deposits
              .filter((d) => d.status && d.status.toLowerCase() === "approved")
              .reduce((a, d) => a + Number(d.amount), 0)}
          </span>
        </div>
      </div>

      <div className="st-section">
        <h3 className="st-section-title">Withdraw History</h3>
        <div className="st-table-container">
          <table className="st-data-table">
            <thead>
              <tr>
                <th>Date/Time</th>
                <th>Amount</th>
                <th>Status</th>
                <th>UPI/ACCOUNT</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupByDate(withdrawals)).map(([date, items], idx) => (
                <React.Fragment key={date}>
                  <tr style={{ background: dateColors[idx % dateColors.length], color: "#fff" }}>
                    <td colSpan={4} style={{ fontWeight: 600 }}>{date}</td>
                  </tr>
                  {items.map((w) => (
                    <tr key={w.id}>
                      <td>{formatDate(w.created_at)}</td>
                      <td className="st-amount">₹{w.amount}</td>
                      <td>
                        <span className={`st-status-badge st-${w.status.toLowerCase()}`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="st-utr">{w.utr}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="st-total">
          <span className="st-total-label">Total Withdrawn:</span>
          <span className="st-total-value">
            ₹
            {withdrawals
              .filter((w) => w.status && w.status.toLowerCase() === "approved")
              .reduce((a, w) => a + Number(w.amount), 0)}
          </span>
        </div>
      </div>

      <div className="st-section">
        <div className="st-filter-control">
          <label className="st-filter-label">
            <b>Filter by Game: </b>
          </label>
          <select
            className="st-filter-select"
            value={gameFilter}
            onChange={(e) => setGameFilter(e.target.value)}
          >
            <option value="all">All</option>
            {uniqueGames.map((game) => (
              <option key={game} value={game}>
                {game}
              </option>
            ))}
          </select>
        </div>

        <h3 className="st-section-title">Bet History (Last 2 Months)</h3>
        <div className="st-table-container">
          <table className="st-data-table">
            <thead>
              <tr>
                <th>Date/Time</th>
                <th>Game</th>
                <th>Number</th>
                <th>Ander</th>
                <th>Bahar</th>
                <th>Bet Amount</th>
                <th>Status</th>
                <th>Win Amount</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupByDate(filteredBets)).map(([date, items], idx) => (
                <React.Fragment key={date}>
                  <tr style={{ background: dateColors[idx % dateColors.length], color: "#fff" }}>
                    <td colSpan={8} style={{ fontWeight: 600 }}>{date}</td>
                  </tr>
                  {items.map((bet) => (
                    <tr key={bet.id}>
                      <td>{formatDate(bet.created_at)}</td>
                      <td className="st-game-name">{bet.game_name}</td>
                      <td>
                        {bet.bet_type === "number" ? bet.number : "-"}
                        {bet.bet_type === "number" && (
                          <span style={{ color: "#888", fontSize: "12px" }}>
                            {" "}
                            (₹{bet.amount})
                          </span>
                        )}
                      </td>
                      <td>
                        {bet.bet_type === "andar" ? bet.number : "-"}
                        {bet.bet_type === "andar" && (
                          <span style={{ color: "#888", fontSize: "12px" }}>
                            {" "}
                            (₹{bet.amount})
                          </span>
                        )}
                      </td>
                      <td>
                        {bet.bet_type === "bahar" ? bet.number : "-"}
                        {bet.bet_type === "bahar" && (
                          <span style={{ color: "#888", fontSize: "12px" }}>
                            {" "}
                            (₹{bet.amount})
                          </span>
                        )}
                      </td>
                      <td className="st-amount">₹{bet.amount}</td>
                      <td>
                        <span className={`st-status-badge st-${bet.status}`}>
                          {bet.status === "won"
                            ? "Won"
                            : bet.status === "lost"
                            ? "Lost"
                            : bet.status}
                        </span>
                      </td>
                      <td className="st-amount">₹{bet.win_amount}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="st-total">
          <span className="st-total-label">Total Bets Amount:</span>
          <span className="st-total-value">
            ₹{filteredBets.reduce((a, b) => a + Number(b.amount), 0)}
          </span>
        </div>

        <div className="st-game-totals">
          <h4 className="st-subtitle">Game-wise Bet Totals:</h4>
          <ul className="st-game-list">
            {Object.entries(gameWiseTotals).map(([game, total]) => (
              <li key={game} className="st-game-item">
                <span className="st-game-label">{game}:</span>
                <span className="st-game-value">₹{total}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="st-total">
          <span className="st-total-label">Total Win Amount:</span>
          <span className="st-total-value">
            ₹{filteredBets.reduce((a, b) => a + Number(b.win_amount), 0)}
          </span>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="st-modal-overlay">
          <div className="st-modal">
            <h3>Edit User Details</h3>
            <div className="st-modal-row">
              <label>Mobile:</label>
              <input
                type="text"
                name="mobile"
                value={editFields.mobile}
                onChange={handleEditInputChange}
              />
            </div>
            <div className="st-modal-row">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={editFields.email}
                onChange={handleEditInputChange}
              />
            </div>
            <div className="st-modal-row">
              <label>Total Winning Amount:</label>
              <input
                type="number"
                name="total_winning"
                value={editFields.total_winning}
                onChange={handleEditInputChange}
              />
            </div>
            <div className="st-modal-row">
              <label>Main Balance:</label>
              <input
                type="number"
                name="total_wallet"
                value={editFields.total_wallet}
                onChange={handleEditInputChange}
              />
            </div>
            <div className="st-modal-actions">
              <button
                className="st-action-btn st-save-btn"
                onClick={handleSaveEdit}
                disabled={actionLoading}
              >
                Save
              </button>
              <button
                className="st-action-btn st-cancel-btn"
                onClick={() => setShowEditModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails;