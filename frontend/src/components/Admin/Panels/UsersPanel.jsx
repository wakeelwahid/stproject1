import React, { useState, useEffect } from "react";
import adminAxios from "../../utils/adminAxios";
import "./panels.css";
import { useNavigate } from "react-router-dom";

const UsersPanel = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Enhanced filter states
  const [filters, setFilters] = useState({
    minBalance: "",
    maxBalance: "",
    minDeposit: "",
    maxDeposit: "",
    minWithdraw: "",
    maxWithdraw: "",
    minEarning: "",
    maxEarning: "",
    minTodayDeposit: "",
    maxTodayDeposit: "",
    minTodayWithdraw: "",
    maxTodayWithdraw: "",
    minReferrals: "",
    maxReferrals: "",
    minReferralEarnings: "",
    maxReferralEarnings: "",
    status: "all",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAxios.get("admin/users-stats/");
      setUsers(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch users data");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      minBalance: "",
      maxBalance: "",
      minDeposit: "",
      maxDeposit: "",
      minWithdraw: "",
      maxWithdraw: "",
      minEarning: "",
      maxEarning: "",
      minTodayDeposit: "",
      maxTodayDeposit: "",
      minTodayWithdraw: "",
      maxTodayWithdraw: "",
      minReferrals: "",
      maxReferrals: "",
      minReferralEarnings: "",
      maxReferralEarnings: "",
      status: "all",
    });
  };

  const applyFilters = (user) => {
    const balance = parseFloat(user.balance);
    const totalDeposit = parseFloat(user.total_deposit);
    const totalWithdraw = parseFloat(user.total_withdraw);
    const totalEarning = parseFloat(user.total_earning);
    const todayDeposit = parseFloat(user.today_deposit);
    const todayWithdraw = parseFloat(user.today_withdraw);
    const totalReferrals = user.total_referrals;
    const referralEarnings = parseFloat(user.referral_earnings);

    // Status filter
    if (filters.status !== "all" && user.status !== filters.status) {
      return false;
    }

    // Balance filters
    if (filters.minBalance && balance < parseFloat(filters.minBalance))
      return false;
    if (filters.maxBalance && balance > parseFloat(filters.maxBalance))
      return false;

    // Total Deposit filters
    if (filters.minDeposit && totalDeposit < parseFloat(filters.minDeposit))
      return false;
    if (filters.maxDeposit && totalDeposit > parseFloat(filters.maxDeposit))
      return false;

    // Total Withdraw filters
    if (filters.minWithdraw && totalWithdraw < parseFloat(filters.minWithdraw))
      return false;
    if (filters.maxWithdraw && totalWithdraw > parseFloat(filters.maxWithdraw))
      return false;

    // Total Earning filters
    if (filters.minEarning && totalEarning < parseFloat(filters.minEarning))
      return false;
    if (filters.maxEarning && totalEarning > parseFloat(filters.maxEarning))
      return false;

    // Today Deposit filters
    if (
      filters.minTodayDeposit &&
      todayDeposit < parseFloat(filters.minTodayDeposit)
    )
      return false;
    if (
      filters.maxTodayDeposit &&
      todayDeposit > parseFloat(filters.maxTodayDeposit)
    )
      return false;

    // Today Withdraw filters
    if (
      filters.minTodayWithdraw &&
      todayWithdraw < parseFloat(filters.minTodayWithdraw)
    )
      return false;
    if (
      filters.maxTodayWithdraw &&
      todayWithdraw > parseFloat(filters.maxTodayWithdraw)
    )
      return false;

    // Referrals filters
    if (filters.minReferrals && totalReferrals < parseInt(filters.minReferrals))
      return false;
    if (filters.maxReferrals && totalReferrals > parseInt(filters.maxReferrals))
      return false;

    // Referral Earnings filters
    if (
      filters.minReferralEarnings &&
      referralEarnings < parseFloat(filters.minReferralEarnings)
    )
      return false;
    if (
      filters.maxReferralEarnings &&
      referralEarnings > parseFloat(filters.maxReferralEarnings)
    )
      return false;

    return true;
  };

  const filteredUsers = users.filter((user) => {
    // Search filter
    const searchMatch = [user.username, user.mobile, user.email, user.status]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return searchMatch && applyFilters(user);
  });

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "blocked" : "active";
      // You can implement the API call here
      console.log(
        `Toggle status for user ${userId} from ${currentStatus} to ${newStatus}`
      );
      // After successful API call, refresh the users list
      // await fetchUsers();
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const viewUserDetails = (userId) => {
    console.log(`View details for user ${userId}`);
    // You can implement navigation to user details page here
  };

  if (loading) {
    return (
      <div className="panel">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchUsers} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Users Management ({filteredUsers.length} users)</h2>
        <button onClick={fetchUsers} className="refresh-btn">
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by username, mobile, email, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Enhanced Users Table */}
      <div className="table-container">
        <div className="table-scroll">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Mobile</th>
                <th>Deposit Balance</th>
                <th>Main Balance</th>
                <th>Total Deposit</th>
                <th>Total Withdraw</th>
                <th>Winning Amount</th> {/* Only bet winnings */}
                <th>Today Deposit</th>
                <th>Today Withdraw</th>
                <th>Total Referrals</th>
                <th>Referral Earnings</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/admin/dashboard/user/${user.id}`)}
                >
                  <td>{user.id}</td>
                  <td className="username-cell">{user.username}</td>
                  <td>{user.mobile}</td>
                  <td className="amount-cell">
                    ₹{parseFloat(user.balance).toFixed(2)}
                  </td>
                  <td className="amount-cell">
                    ₹
                    {typeof user.balance !== "undefined" &&
                    typeof user.bonus !== "undefined" &&
                    typeof user.winnings !== "undefined"
                      ? (
                          parseFloat(user.balance || 0) +
                          parseFloat(user.bonus || 0) +
                          parseFloat(user.winnings || 0)
                        ).toFixed(2)
                      : "0.00"}
                  </td>
                  <td className="amount-cell">
                    ₹{parseFloat(user.total_deposit).toFixed(2)}
                  </td>
                  <td className="amount-cell">
                    ₹{parseFloat(user.total_withdraw).toFixed(2)}
                  </td>
                  <td className="amount-cell">
                    ₹{parseFloat(user.winnings || 0).toFixed(2)}
                  </td>
                  <td className="amount-cell">
                    ₹{parseFloat(user.today_deposit).toFixed(2)}
                  </td>
                  <td className="amount-cell">
                    ₹{parseFloat(user.today_withdraw).toFixed(2)}
                  </td>
                  <td className="referral-cell">{user.total_referrals}</td>
                  <td className="amount-cell">
                    ₹{parseFloat(user.referral_earnings).toFixed(2)}
                  </td>
                  <td>
                    <span
                      className={
                        user.status === "active"
                          ? "status-active"
                          : user.status === "blocked"
                          ? "status-blocked"
                          : "status-other"
                      }
                    >
                      {user.status === "active"
                        ? "Active"
                        : user.status === "blocked"
                        ? "Blocked"
                        : user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="no-data">
          <p>No users found matching the current filters.</p>
        </div>
      )}
    </div>
  );
};

export default UsersPanel;
