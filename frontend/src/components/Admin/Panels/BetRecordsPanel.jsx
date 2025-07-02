import React, { useState, useEffect } from "react";
import "./panels.css";

const games = [
  "DIAMOND KING",
  "JAIPUR KING",
  "FARIDABAD",
  "GHAZIABAD",
  "GALI",
  "DISAWER",
];

const DIAMOND_SESSIONS = [
  { session_no: 1, open_time: "06:00", close_time: "07:50", result_time: "08:00" },
  { session_no: 2, open_time: "08:10", close_time: "09:50", result_time: "10:00" },
  { session_no: 3, open_time: "10:10", close_time: "11:50", result_time: "12:00" },
  { session_no: 4, open_time: "12:10", close_time: "13:50", result_time: "14:00" },
  { session_no: 5, open_time: "14:10", close_time: "15:50", result_time: "16:00" },
  { session_no: 6, open_time: "16:10", close_time: "17:50", result_time: "18:00" },
  { session_no: 7, open_time: "18:10", close_time: "19:50", result_time: "20:00" },
  { session_no: 8, open_time: "20:10", close_time: "21:50", result_time: "22:00" },
  { session_no: 9, open_time: "22:10", close_time: "23:50", result_time: "00:00" },
];

const BetRecordsPanel = () => {
  const [selectedGame, setSelectedGame] = useState(games[0]);
  const [sessions, setSessions] = useState([]);
  const [currentIST, setCurrentIST] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBetRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setError("Unauthorized: Admin token missing.");
        setSessions([]);
        setLoading(false);
        return;
      }
      const res = await fetch(
        `https://stproject1.onrender.com/api/admin/bets/?game=${encodeURIComponent(selectedGame)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status === 401) {
        setError("Unauthorized: Please login again.");
        setSessions([]);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch bet records");
      const data = await res.json();
      const selectedData = data[selectedGame];
      if (!selectedData || !Array.isArray(selectedData.sessions)) {
        setSessions([]);
        setLoading(false);
        return;
      }
      setSessions(selectedData.sessions);
      setCurrentIST(data.current_ist || null);
    } catch (err) {
      setError(err.message);
      setSessions([]);
    }
    setLoading(false);
  };
  

  useEffect(() => {
    fetchBetRecords();
    // eslint-disable-next-line
  }, [selectedGame]);

  // Helper: get today's date in YYYY-MM-DD (from IST if available)
   const getToday = () => {
    let d;
    if (currentIST) {
      d = new Date(currentIST.replace(" ", "T") + "+05:30");
    } else {
      d = new Date();
    }
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Table row generator: Only show numbers where bet is placed, but serial wise
  const renderNumberRows = (bets) => {
    // Map for fast lookup
    const numberMap = {};
    const andarMap = {};
    const baharMap = {};
    const statusMap = {};
    const createdAtMap = {};

    bets.forEach((bet) => {
      if (bet.number !== "" && bet.number !== undefined) {
        numberMap[bet.number.padStart(2, "0")] = bet.amount || 0;
        statusMap[bet.number.padStart(2, "0")] = bet.status || "-";
        createdAtMap[bet.number.padStart(2, "0")] = bet.created_at || "";
      }
      if (bet.andar_number !== "" && bet.andar_number !== undefined) {
        andarMap[bet.andar_number.padStart(2, "0")] = bet.andarAmount || 0;
        statusMap[bet.andar_number.padStart(2, "0")] = bet.status || "-";
        createdAtMap[bet.andar_number.padStart(2, "0")] = bet.created_at || "";
      }
      if (bet.bahar_number !== "" && bet.bahar_number !== undefined) {
        baharMap[bet.bahar_number.padStart(2, "0")] = bet.baharAmount || 0;
        statusMap[bet.bahar_number.padStart(2, "0")] = bet.status || "-";
        createdAtMap[bet.bahar_number.padStart(2, "0")] = bet.created_at || "";
      }
    });

    // Collect all unique numbers where any bet is placed
    const allNumbers = new Set([
      ...Object.keys(numberMap),
      ...Object.keys(andarMap),
      ...Object.keys(baharMap),
    ]);

    // Sort numbers serial wise (00, 01, ..., 99)
    const sortedNumbers = Array.from(allNumbers).sort((a, b) => parseInt(a) - parseInt(b));

    return sortedNumbers.map((num) => {
      const numberAmount = numberMap[num] || 0;
      const andarAmount = andarMap[num] || 0;
      const baharAmount = baharMap[num] || 0;
      const total = numberAmount + andarAmount + baharAmount;
      const status = statusMap[num] || "-";
      const createdAt = createdAtMap[num] || "-";
      // Highlight 0-10
      const highlightClass =
        parseInt(num, 10) >= 0 && parseInt(num, 10) <= 10 ? "highlight-row" : "";
      return (
        <tr key={num} className={highlightClass}>
          <td>{num}</td>
          <td>₹{numberAmount}</td>
          <td>{num}</td>
          <td>₹{andarAmount}</td>
          <td>{num}</td>
          <td>₹{baharAmount}</td>
          <td>₹{total}</td>
          <td>{status}</td>
          <td>{createdAt}</td>
        </tr>
      );
    });
  };

  // Find current and previous session for Diamond King
  const getDiamondKingSessionsToShow = () => {
    // Use backend IST time if available, else fallback to browser time
    let now;
    if (currentIST) {
      now = new Date(currentIST.replace(" ", "T") + "+05:30");
    } else {
      now = new Date();
    }
    const today = now.toISOString().slice(0, 10);

    let currentIdx = -1;
    for (let i = 0; i < DIAMOND_SESSIONS.length; i++) {
      const s = DIAMOND_SESSIONS[i];
      const open = new Date(`${today}T${s.open_time}:00+05:30`);
      const close = new Date(`${today}T${s.close_time}:00+05:30`);
      if (close < open) close.setDate(close.getDate() + 1);
      if (now >= open && now <= close) {
        currentIdx = i;
        break;
      }
      if (i === 0 && now < open) {
        currentIdx = 0;
        break;
      }
      if (i === DIAMOND_SESSIONS.length - 1 && now > close) {
        currentIdx = i;
      }
    }
    if (currentIdx === -1) currentIdx = DIAMOND_SESSIONS.length - 1;

    const showSessions = [];
    if (currentIdx > 0)
      showSessions.push({
        ...DIAMOND_SESSIONS[currentIdx - 1],
        type: "previous",
      });
    showSessions.push({ ...DIAMOND_SESSIONS[currentIdx], type: "current" });

    showSessions.sort((a, b) => (a.type === "current" ? -1 : 1));
    return showSessions;
  };

  return (
    <div className="panel bet-records-panel">
      <h2 className="panel-title">Bet Records</h2>
      <div className="bet-records-controls">
        <select
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          className="game-select dark"
        >
          {games.map((game) => (
            <option key={game} value={game}>
              {game}
            </option>
          ))}
        </select>
      </div>
      {loading && <p>Loading bet records...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          {sessions.length === 0 && <p>No bet records found.</p>}

          {selectedGame === "DIAMOND KING"
            ? getDiamondKingSessionsToShow().map((session) => {
                const bets =
                  sessions.find((s) => s.session_no === session.session_no)
                    ?.bets || [];
                // Calculate totals for this session
                let numberTotal = 0,
                  andarTotal = 0,
                  baharTotal = 0,
                  totalAmount = 0;
                bets.forEach((bet) => {
                  numberTotal += bet.amount || 0;
                  andarTotal += bet.andarAmount || 0;
                  baharTotal += bet.baharAmount || 0;
                  totalAmount +=
                    (bet.amount || 0) +
                    (bet.andarAmount || 0) +
                    (bet.baharAmount || 0);
                });

                return (
                  <div className="session-block" key={session.session_no}>
                    <div
                      className={`session-info ${
                        session.type === "current"
                          ? "session-info-current"
                          : "session-info-previous"
                      }`}
                      style={{ marginBottom: 8 }}
                    >
                      <strong>
                        {session.type === "current"
                          ? "Current Session"
                          : "Previous Session"}
                        {` #${session.session_no}`}
                      </strong>
                      <span style={{ marginLeft: 10 }}>
                        Date: {getToday()} | Open: {session.open_time} | Close:{" "}
                        {session.close_time} | Result: {session.result_time}
                      </span>
                    </div>
                    <div
                      className="bet-records-summary"
                      style={{ marginBottom: 8 }}
                    >
                      <div className="summary-card">
                        <h3>Total Bets</h3>
                        <p>{bets.length}</p>
                      </div>
                      <div className="summary-card highlight">
                        <h3>Total Bet Amount</h3>
                        <p>₹{totalAmount}</p>
                      </div>
                      <div className="summary-card number-total">
                        <h3>Total Number Amount</h3>
                        <p>₹{numberTotal}</p>
                      </div>
                      <div className="summary-card andar">
                        <h3>Andar Total</h3>
                        <p>₹{andarTotal}</p>
                      </div>
                      <div className="summary-card bahar">
                        <h3>Bahar Total</h3>
                        <p>₹{baharTotal}</p>
                      </div>
                    </div>
                    <div className="bet-records-table">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Number</th>
                            <th>Number Amount</th>
                            <th>Andar Number</th>
                            <th>Andar Amount</th>
                            <th>Bahar Number</th>
                            <th>Bahar Amount</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Placed At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {renderNumberRows(bets)}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            : sessions.length > 0 &&
              sessions.map((session, idx) => {
                const bets = session.bets || [];
                let numberTotal = 0,
                  andarTotal = 0,
                  baharTotal = 0,
                  totalAmount = 0;
                bets.forEach((bet) => {
                  numberTotal += bet.amount || 0;
                  andarTotal += bet.andarAmount || 0;
                  baharTotal += bet.baharAmount || 0;
                  totalAmount +=
                    (bet.amount || 0) +
                    (bet.andarAmount || 0) +
                    (bet.baharAmount || 0);
                });

                return (
                  <div
                    className="session-block"
                    key={session.type + (session.session_no || session.date)}
                  >
                    <div
                      className={`session-info ${
                        session.type === "current"
                          ? "session-info-current"
                          : "session-info-previous"
                      }`}
                      style={{ marginBottom: 8 }}
                    >
                      <strong>
                        {session.type === "current"
                          ? "Current Session"
                          : "Previous Session"}
                        {session.session_no ? ` #${session.session_no}` : ""}
                      </strong>
                       <span style={{ marginLeft: 10 }}>
                        Date: {getToday()} | Open: {session.open_time} | Close:{" "}
                        {session.close_time} | Result: {session.result_time}
                      </span>
                    </div>
                    <div
                      className="bet-records-summary"
                      style={{ marginBottom: 8 }}
                    >
                      <div className="summary-card">
                        <h3>Total Bets</h3>
                        <p>{bets.length}</p>
                      </div>
                      <div className="summary-card highlight">
                        <h3>Total Bet Amount</h3>
                        <p>₹{totalAmount}</p>
                      </div>
                      <div className="summary-card number-total">
                        <h3>Total Number Amount</h3>
                        <p>₹{numberTotal}</p>
                      </div>
                      <div className="summary-card andar">
                        <h3>Andar Total</h3>
                        <p>₹{andarTotal}</p>
                      </div>
                      <div className="summary-card bahar">
                        <h3>Bahar Total</h3>
                        <p>₹{baharTotal}</p>
                      </div>
                    </div>
                    <div className="bet-records-table">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Number</th>
                            <th>Number Amount</th>
                            <th>Andar Number</th>
                            <th>Andar Amount</th>
                            <th>Bahar Number</th>
                            <th>Bahar Amount</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Placed At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {renderNumberRows(bets)}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
        </>
      )}
    </div>
  );
};

export default BetRecordsPanel;