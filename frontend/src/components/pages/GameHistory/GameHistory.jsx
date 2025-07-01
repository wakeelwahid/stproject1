import React, { useEffect, useState } from "react";
import "./GameHistory.css";
import axios from "axios";

const GameHistory = () => {
  const [bets, setBets] = useState([]);
  const [filteredBets, setFilteredBets] = useState([]);
  const [selectedGame, setSelectedGame] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const betsPerPage = 5;

  useEffect(() => {
    const fetchBets = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://127.0.0.1:8000/api/view-bets-history/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Grouping by game + timestamp
        const grouped = {};
        res.data.forEach((bet) => {
          const key = `${bet.game}|${bet.timestamp}`;
          if (!grouped[key]) {
            grouped[key] = {
              game: bet.game,
              timestamp: bet.timestamp,
              status: bet.status || "pending",
              winning_number: bet.winning_number || null,
              session_start: bet.session_start, // fix: add this
              session_end: bet.session_end, // fix: add this
              bets: [],
            };
          }
          grouped[key].bets.push(bet);
        });

        const betGroups = Object.values(grouped);
        setBets(betGroups);
        setFilteredBets(betGroups);
      } catch (error) {
        console.error("Fetch error:", error);
        setBets([]);
        setFilteredBets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, []);

  useEffect(() => {
    if (selectedGame === "all") {
      setFilteredBets(bets);
    } else {
      setFilteredBets(
        bets.filter((b) => b.game.toLowerCase() === selectedGame.toLowerCase())
      );
    }
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedGame, bets]);

  // Pagination logic
  const indexOfLastBet = currentPage * betsPerPage;
  const indexOfFirstBet = indexOfLastBet - betsPerPage;
  const currentBets = filteredBets.slice(indexOfFirstBet, indexOfLastBet);
  const totalPages = Math.ceil(filteredBets.length / betsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Generate color based on number
  const getNumberColor = (number) => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F06292",
      "#7986CB",
      "#9575CD",
      "#64B5F6",
      "#4DB6AC",
      "#81C784",
      "#FFD54F",
      "#FF8A65",
      "#A1887F",
      "#90A4AE",
    ];
    return colors[number % colors.length];
  };

  return (
    <div className="game-history-container">
      <header className="history-header">
        <h1 className="history-title">GAME HISTORY</h1>
        <p className="history-subtitle">Your betting journey at a glance</p>
      </header>

      <div className="filter-controls">
        <div className="filter-group">
          <span className="filter-label">Game:</span>
          <select
            className="filter-select"
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
          >
            <option value="all">All Games</option>
            <option value="JAIPUR KING">Jaipur King</option>
            <option value="GALI">Gali</option>
            <option value="DISAWER">Disawer</option>
            <option value="FARIDABAD">Faridabad</option>
            <option value="DIAMOND KING">Diamond King</option>
            <option value="GHAZIABAD">Ghaziabad</option>
          </select>
        </div>
        <div className="filter-group">
          <span className="results-count">
            Showing {indexOfFirstBet + 1}-
            {Math.min(indexOfLastBet, filteredBets.length)} of{" "}
            {filteredBets.length} results
          </span>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your game history...</p>
        </div>
      ) : currentBets.length === 0 ? (
        <div className="no-results">
          <img
            src="/images/empty-state.svg"
            alt="No bets found"
            className="empty-icon"
          />
          <p>No bets found for your selection</p>
          <button
            className="refresh-btn"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      ) : (
        currentBets.map((group, idx) => (
          <div className="game-card" key={idx}>
            <div className="game-header">
              <div className="game-info">
                <div className="game-name">{group.game?.toUpperCase()}</div>
              </div>
              <div className="game-date">
                <i className="fas fa-calendar-alt"></i>
                {new Date(group.session_start).toLocaleString()} -{" "}
                {new Date(group.session_end).toLocaleString()}
              </div>
            </div>

            <div className="game-numbers-container">
              <div className="game-numbers">
                {group.bets.map((bet, i) => {
                  const isAndar = bet.bet_type === "andar";
                  const isBahar = bet.bet_type === "bahar";
                  const isWinning = group.winning_number === bet.number;
                  const numberColor = getNumberColor(bet.number);

                  return (
                    <div
                      key={i}
                      className={`number-ball ${isAndar ? "andar" : ""} ${
                        isBahar ? "bahar" : ""
                      } ${isWinning ? "winning-number" : ""}`}
                      style={{
                        backgroundColor: isWinning ? "#4CAF50" : numberColor,
                        transform: isWinning ? "scale(1.1)" : "scale(1)",
                      }}
                    >
                      <div className="number-value">{bet.number}</div>
                      <div className="bet-type-badge">
                        {isAndar ? "A" : isBahar ? "B" : ""}
                      </div>
                      <div className="bet-amount">₹{bet.amount}</div>
                      {isWinning && (
                        <div className="winning-crown">
                          <i className="fas fa-crown"></i>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="game-summary">
              <div className="summary-item">
                <span className="summary-label">Total Bet Amount :</span>
                <span className="summary-value highlight">
                  ₹{group.bets.reduce((sum, b) => sum + Number(b.amount), 0)}
                </span>
              </div>
            </div>
          </div>
        ))
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className={`page-btn ${currentPage === 1 ? "disabled" : ""}`}
            onClick={() => currentPage > 1 && paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <i className="fas fa-chevron-left"></i>
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={i}
                className={`page-btn ${
                  currentPage === pageNum ? "active" : ""
                }`}
                onClick={() => paginate(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            className={`page-btn ${
              currentPage === totalPages ? "disabled" : ""
            }`}
            onClick={() =>
              currentPage < totalPages && paginate(currentPage + 1)
            }
            disabled={currentPage === totalPages}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default GameHistory;
