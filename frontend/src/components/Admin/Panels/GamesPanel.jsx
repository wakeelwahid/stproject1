import React, { useEffect, useState } from 'react';
import adminAxios from "../../utils/adminAxios";
import './panels.css';

const GamesPanel = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(null);

  // Fetch games stats from backend
  const fetchGames = async () => {
    setLoading(true);
    try {
      const res = await adminAxios.get("/admin/games-stats/");
      setGames(res.data);
    } catch (err) {
      setGames([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleReset = async (gameId) => {
    if (!window.confirm('Are you sure you want to reset all stats for this game?')) return;
    setResetting(gameId);
    try {
      await adminAxios.post(`/admin/game/${gameId}/reset/`);
      await fetchGames();
    } catch (err) {
      alert("Failed to reset game stats.");
    }
    setResetting(null);
  };

  if (loading) return <div className="panel">Loading...</div>;

  return (
    <div className="panel games-panel">
      <h2>Games Management</h2>
      <div className="games-grid">
        {games.map(game => (
          <div key={game.id} className="game-stats-card">
            <div className="game-header">
              <h3>{game.name}</h3>
              {game.commissionApplicable && (
                <span className="commission-badge" title="Referral commission is given on this game">
                  Commission 1%
                </span>
              )}
            </div>
            <div className="game-timings">
              <div>
                <span className="timing-label">Open:</span>
                <span className="timing-value">{game.openTime}</span>
              </div>
              <div>
                <span className="timing-label">Close:</span>
                <span className="timing-value">{game.closeTime}</span>
              </div>
            </div>
            <div className="game-stats">
              <div className="stat-item">
                <span className="stat-label">Total Bets</span>
                <span className="gm-stat-value">{game.totalBets?.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Amount</span>
                <span className="gm-stat-value">₹{game.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Earnings</span>
                <span className="gm-stat-value">₹{game.totalEarnings?.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Monthly Earnings</span>
                <span className="gm-stat-value">₹{game.monthlyEarnings?.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Monthly Bets</span>
                <span className="gm-stat-value">{game.monthlyBets?.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Monthly Bets amount</span>
                <span className="gm-stat-value">₹{game.monthlyBetsAmount?.toLocaleString()}</span>
              </div>
            </div>
            <div className="game-actions">
              <button
                className="reset-btn"
                onClick={() => handleReset(game.id)}
                disabled={resetting === game.id}
              >
                {resetting === game.id ? "Resetting..." : "Reset Stats"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamesPanel;