import React, { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faMoneyBillWave,
  faHandHoldingDollar,
  faArrowUp,
  faArrowDown,
  faUserPlus,
  faTrophy,
  faMoneyBillTransfer,
} from "@fortawesome/free-solid-svg-icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import adminAxios from "../../utils/adminAxios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsPanel = () => {
  const [earningsFilter, setEarningsFilter] = useState("7days");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const isDarkMode =
    document.documentElement.getAttribute("data-theme") !== "light";

  useEffect(() => {
    adminAxios
      .get("/admin/dashboard-stats/", {
        params: { chart: "1" }, // tell backend to send chart data too
      })
      .then((res) => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          color: "#ffffff",
          font: {
            weight: 500,
            size: 12,
          },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255,255,255,0.05)",
          drawBorder: false,
        },
        ticks: {
          color: "#8f9bb3",
          font: {
            size: 11,
          },
          callback: function (value) {
            return value.toLocaleString();
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#8f9bb3",
          font: {
            size: 11,
          },
        },
      },
    },
  };

  // Use API chart data if available, else fallback to mock
  const earningData =
    stats && stats.earnings_chart && earningsFilter === "7days"
      ? {
          labels: stats.earnings_chart.labels,
          datasets: [
            {
              label: "Daily Earnings",
              data: stats.earnings_chart.data,
              borderColor: isDarkMode ? "#4CAF50" : "#2E7D32",
              backgroundColor: isDarkMode
                ? "rgba(76, 175, 80, 0.2)"
                : "rgba(46, 125, 50, 0.15)",
              fill: true,
            },
          ],
        }
      : earningsFilter === "1month" && stats && stats.earnings_chart_month
      ? {
          labels: stats.earnings_chart_month.labels,
          datasets: [
            {
              label: "Monthly Earnings",
              data: stats.earnings_chart_month.data,
              borderColor: "#4CAF50",
              backgroundColor: "rgba(76, 175, 80, 0.2)",
              fill: true,
            },
          ],
        }
      : {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            {
              label: "Daily Earnings",
              data: [12500, 19000, 15000, 22000, 18000, 25000, 20000],
              borderColor: isDarkMode ? "#4CAF50" : "#2E7D32",
              backgroundColor: isDarkMode
                ? "rgba(76, 175, 80, 0.2)"
                : "rgba(46, 125, 50, 0.15)",
              fill: true,
            },
          ],
        };

  const userActivityData =
    stats && stats.user_activity_chart
      ? {
          labels: stats.user_activity_chart.labels,
          datasets: [
            {
              label: "Total Active Users",
              data: stats.user_activity_chart.active,
              backgroundColor: isDarkMode ? "#2196F3" : "#1976D2",
            },
            {
              label: "New Users",
              data: stats.user_activity_chart.new,
              backgroundColor: isDarkMode ? "#4CAF50" : "#2E7D32",
            },
          ],
        }
      : {
          labels: ["March", "April", "May"],
          datasets: [
            {
              label: "Total Active Users",
              data: [1245, 1532, 1678],
              backgroundColor: isDarkMode ? "#2196F3" : "#1976D2",
            },
            {
              label: "New Users",
              data: [245, 332, 378],
              backgroundColor: isDarkMode ? "#4CAF50" : "#2E7D32",
            },
          ],
        };

  return (
    <div className="analytics-panel">
      <div className="stats-grid">
        <div className="stat-box gradient-purple">
          <div className="stat-title">
            <FontAwesomeIcon icon={faMoneyBillWave} className="icon-glow" /> Net
            Revenue
          </div>
          <div className="stat-value">
            {stats ? `₹${stats.net_revenue}` : "Loading..."}
          </div>
        </div>
        <div className="stat-box gradient-blue">
          <div className="stat-title">
            <FontAwesomeIcon icon={faUsers} className="icon-glow" /> Total Users
          </div>
          <div className="stat-value">
            {stats ? stats.total_users : "Loading..."}
          </div>
        </div>
        <div className="stat-box gradient-green">
          <div className="stat-title">
            <FontAwesomeIcon icon={faArrowUp} className="icon-glow" /> Pending
            Deposits
          </div>
          <div className="stat-value">
            {stats ? stats.pending_deposits : "Loading..."}
          </div>
        </div>
        <div className="stat-box gradient-orange">
          <div className="stat-title">
            <FontAwesomeIcon icon={faArrowDown} className="icon-glow" /> Pending
            Withdrawals
          </div>
          <div className="stat-value">
            {stats ? stats.pending_withdrawals : "Loading..."}
          </div>
        </div>
        <div className="stat-box gradient-cyan">
          <div className="stat-title">
            <FontAwesomeIcon icon={faMoneyBillTransfer} className="icon-glow" />{" "}
            Today's Earnings
          </div>
          <div className="stat-value">
            {stats ? `₹${stats.today_earnings}` : "Loading..."}
          </div>
        </div>
        <div className="stat-box gradient-success">
          <div className="stat-title">
            <FontAwesomeIcon icon={faArrowUp} className="icon-glow" /> Today's
            Deposits
          </div>
          <div className="stat-value">
            {stats ? `₹${stats.today_deposits}` : "Loading..."}
          </div>
        </div>
        <div className="stat-box gradient-warning">
          <div className="stat-title">
            <FontAwesomeIcon icon={faArrowDown} className="icon-glow" /> Today's
            Withdrawals
          </div>
          <div className="stat-value">
            {stats ? `₹${stats.today_withdrawals}` : "Loading..."}
          </div>
        </div>
        <div className="stat-box gradient-indigo">
          <div className="stat-title">
            <FontAwesomeIcon icon={faMoneyBillWave} className="icon-glow" />{" "}
            Total Deposits
          </div>
          <div className="stat-value">
            {stats ? `₹${stats.total_deposits}` : "Loading..."}
          </div>
        </div>
        <div className="stat-box gradient-rose">
          <div className="stat-title">
            <FontAwesomeIcon icon={faMoneyBillTransfer} className="icon-glow" />{" "}
            Total Withdrawals
          </div>
          <div className="stat-value">
            {stats ? `₹${stats.total_withdrawals}` : "Loading..."}
          </div>
        </div>
        <div className="stat-box gradient-teal">
          <div className="stat-title">
            <FontAwesomeIcon icon={faUserPlus} className="icon-glow" /> New
            Users Today
          </div>
          <div className="stat-value">
            {stats ? stats.new_users_today : "Loading..."}
          </div>
        </div>
        <div className="stat-box gradient-teal">
          <div className="stat-title">
            <FontAwesomeIcon icon={faMoneyBillWave} className="icon-glow" />
            Available Deposit Balance
          </div>
          <div className="stat-value">
            {stats ? `₹${stats.available_deposit_balance}` : "Loading..."}
          </div>
        </div>
        <div className="stat-box gradient-teal">
          <div className="stat-title">
            <FontAwesomeIcon icon={faHandHoldingDollar} className="icon-glow" />
            Total Wallet Balance
          </div>
          <div className="stat-value">
            {stats ? `₹${stats.total_wallet_balance}` : "Loading..."}
          </div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-box">
          <div className="chart-header">
            <h3>Revenue Analytics</h3>
            <select
              className="earnings-filter"
              value={earningsFilter}
              onChange={(e) => setEarningsFilter(e.target.value)}
            >
              <option value="7days">Last 7 Days</option>
              <option value="1month">Last Month</option>
            </select>
          </div>
          <Line data={earningData} options={chartOptions} />
        </div>
        <div className="chart-box">
          <h3>Active Users (Last 3 Months)</h3>
          <Bar data={userActivityData} options={chartOptions} />
        </div>
      </div>

      <div className="recent-data-grid">
        <div className="recent-box">
          <h3>Recent Transactions</h3>
          <div className="recent-list">
            {stats &&
            stats.recent_transactions &&
            stats.recent_transactions.length > 0 ? (
              stats.recent_transactions.map((tx, i) => (
                <div key={i} className="recent-item">
                  <div className="item-user">{tx.user}</div>
                  <div className="item-details">
                    <span
                      className={
                        tx.type === "Deposit"
                          ? "amount-positive"
                          : "amount-negative"
                      }
                    >
                      {tx.amount}
                    </span>
                    <span className="item-time">{tx.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: "#aaa", padding: 8 }}>
                No recent transactions
              </div>
            )}
          </div>
        </div>

        <div className="recent-box">
          <h3>Recent Winners</h3>
          <div className="recent-list">
            {stats &&
            stats.recent_winners &&
            stats.recent_winners.length > 0 ? (
              stats.recent_winners.map((winner, i) => (
                <div key={i} className="recent-item">
                  <div className="item-user">
                    <FontAwesomeIcon icon={faTrophy} className="winner-icon" />{" "}
                    {winner.user}
                  </div>
                  <div className="item-details">
                    <span className="game-name">{winner.game}</span>
                    <span className="amount-positive">{winner.amount}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: "#aaa", padding: 8 }}>No recent winners</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
