import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCrown,
  FaGem,
  FaCoins,
  FaTrophy,
  FaLock,
  FaClock,
  FaArrowRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Boxes.css";

// Parse "HH:MM" to Date object (today)
function parseTime(str) {
  const [h, m] = str.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

// Format "HH:MM" to 12hr string
function formatTime(str) {
  const [h, m] = str.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Check if now is between start and end (handles overnight)
function isBetween(now, start, end) {
  if (start < end) return now >= start && now < end;
  return now >= start || now < end;
}

// Diamond King session logic: lock after close, next open at next session start
function getDiamondKingStatus(now) {
  const diamondGame = GAME_SCHEDULES.find((g) => g.key === "diamond");
  for (let i = 0; i < diamondGame.sessions.length; i++) {
    const session = diamondGame.sessions[i];
    const start = parseTime(session.start);
    const end = parseTime(session.end);
    const result = parseTime(session.result || session.end);

    // Open for play: from open to close (including close minute)
    if (now >= start && now < end) {
      return {
        locked: false,
        session,
        lockMsg: `Open till ${formatTime(session.end)}`,
      };
    }
    // Locked: after close till next session open
    if (now >= end && now < (diamondGame.sessions[i + 1]
      ? parseTime(diamondGame.sessions[i + 1].start)
      : parseTime(diamondGame.sessions[0].start))) {
      const nextIdx = (i + 1) % diamondGame.sessions.length;
      return {
        locked: true,
        session,
        nextOpen: formatTime(diamondGame.sessions[nextIdx].start),
        lockMsg: `Locked. Next at ${formatTime(
          diamondGame.sessions[nextIdx].start
        )}`,
      };
    }
  }
  // If not in any session, show next session open time
  return {
    locked: true,
    nextOpen: formatTime(diamondGame.sessions[0].start),
    lockMsg: `Next at ${formatTime(diamondGame.sessions[0].start)}`,
  };
}

// For other games: locked from closeTime to openTime
function getGameLockStatus(game, now) {
  if (game.key === "diamond") return getDiamondKingStatus(now);

  const close = parseTime(game.closeTime);
  const open = parseTime(game.openTime);
  if (isBetween(now, close, open)) {
    return {
      locked: true,
      nextOpen: formatTime(game.openTime),
      lockMsg: `Locked. Opens at ${formatTime(game.openTime)}`,
    };
  }
  return { locked: false, lockMsg: `Open till ${formatTime(game.closeTime)}` };
}

// Diamond King sessions (as per your requirement)
const DIAMOND_SESSIONS = [
  { start: "06:00", end: "07:50", result: "08:00" },
  { start: "08:10", end: "09:50", result: "10:00" },
  { start: "10:10", end: "11:50", result: "12:00" },
  { start: "12:10", end: "13:50", result: "14:00" },
  { start: "14:10", end: "15:50", result: "16:00" },
  { start: "16:10", end: "17:50", result: "18:00" },
  { start: "18:10", end: "19:50", result: "20:00" },
  { start: "20:10", end: "21:50", result: "22:00" },
  { start: "22:10", end: "23:50", result: "00:00" },
];

const GAME_SCHEDULES = [
  {
    key: "jaipur",
    name: "Jaipur King",
    icon: <FaCrown />,
    closeTime: "16:50",
    openTime: "21:00",
    color: "#FFD700",
    accent: "rgba(255, 215, 0, 0.15)",
    bg: "radial-gradient(circle at 30% 40%, rgba(255,215,0,0.2) 0%, rgba(0,0,0,0.7) 80%)",
    path: "/jaipur",
  },
  {
    key: "faridabad",
    name: "Faridabad",
    icon: <FaGem />,
    closeTime: "17:40",
    openTime: "22:00",
    color: "#50C878",
    accent: "rgba(80, 200, 120, 0.15)",
    bg: "radial-gradient(circle at 30% 40%, rgba(80,200,120,0.2) 0%, rgba(0,0,0,0.7) 80%)",
    path: "/faridabad",
  },
  {
    key: "ghaziabad",
    name: "Ghaziabad",
    icon: <FaCoins />,
    closeTime: "19:50",
    openTime: "23:00",
    color: "#4169E1",
    accent: "rgba(65, 105, 225, 0.15)",
    bg: "radial-gradient(circle at 30% 40%, rgba(65,105,225,0.2) 0%, rgba(0,0,0,0.7) 80%)",
    path: "/ghaziabad",
  },
  {
    key: "gali",
    name: "Gali",
    icon: <FaGem />,
    closeTime: "22:30",
    openTime: "04:00",
    color: "#9370DB",
    accent: "rgba(147, 112, 219, 0.15)",
    bg: "radial-gradient(circle at 30% 40%, rgba(147,112,219,0.2) 0%, rgba(0,0,0,0.7) 80%)",
    path: "/gali",
  },
  {
    key: "disawer",
    name: "Disawer",
    icon: <FaCrown />,
    closeTime: "02:30",
    openTime: "07:00",
    color: "#FF6347",
    accent: "rgba(255, 99, 71, 0.15)",
    bg: "radial-gradient(circle at 30% 40%, rgba(255,99,71,0.2) 0%, rgba(0,0,0,0.7) 80%)",
    path: "/disawer",
  },
  {
    key: "diamond",
    name: "Diamond King",
    icon: <FaTrophy />,
    color: "#E0115F",
    accent: "rgba(224, 17, 95, 0.15)",
    bg: "radial-gradient(circle at 30% 40%, rgba(224,17,95,0.2) 0%, rgba(0,0,0,0.7) 80%)",
    path: "/diamond",
    sessions: DIAMOND_SESSIONS,
  },
];

const Boxes = () => {
  const [now, setNow] = useState(new Date());
  const [activeCard, setActiveCard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="game-container">
      {/* Floating Particles Background */}
      <div className="particles-container">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            initial={{
              y: Math.random() * 100 - 50,
              x: Math.random() * 100,
              opacity: 0,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [0, Math.random() * 200 - 100],
              x: [0, Math.random() * 100 - 50],
              opacity: [0, 0.8, 0],
              scale: [1, 1.2],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              background: `rgba(212, 175, 55, ${Math.random() * 0.3 + 0.1})`,
            }}
          />
        ))}
      </div>

      {/* Animated Time Display */}
      <motion.div
        className="time-display"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="clock-icon-container"
          animate={{ rotate: 360 }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <FaClock className="clock-icon" />
        </motion.div>
        <motion.span
          className="time-text"
          key={now.getTime()}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </motion.span>
      </motion.div>

      {/* Game Cards Grid */}
      <div className="game-cards-grid">
        {GAME_SCHEDULES.map((game, idx) => {
          const status = getGameLockStatus(game, now);
          return (
            <motion.div
              key={game.key}
              className={`game-card ${status.locked ? "locked" : ""}`}
              style={{
                "--card-color": game.color,
                "--card-accent": game.accent,
                "--card-bg": game.bg,
              }}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.6,
                delay: idx * 0.1,
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setActiveCard(game.key)}
              onMouseLeave={() => setActiveCard(null)}
            >
              {/* Card Glow Effect */}
              {activeCard === game.key && (
                <motion.div
                  className="card-glow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ duration: 0.3 }}
                />
              )}

              {/* Card Content */}
              <div className="card-content">
                <div className="card-header">
                  <motion.div
                    className="game-icon"
                    animate={{
                      y: [0, -5, 0],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {game.icon}
                  </motion.div>
                  <h3 className="game-title">{game.name}</h3>
                </div>

                <div className="game-schedule">
                  {game.key === "diamond" ? (
                    <>
                      <div className="schedule-item">
                        <span className="schedule-label">Sessions:</span>
                        <span className="schedule-time">
                          06:00, 08:10, 10:10, 12:10, 14:10, 16:10, 18:10, 20:10, 22:10
                        </span>
                      </div>
                      <div className="schedule-item">
                        <span className="schedule-label">Duration:</span>
                        <span className="schedule-time">
                          1h 40m (locked after close, next open at next session)
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="schedule-item">
                        <span className="schedule-label">Open:</span>
                        <span className="schedule-time">
                          {formatTime(game.openTime)}
                        </span>
                      </div>
                      <div className="schedule-item">
                        <span className="schedule-label">Close:</span>
                        <span className="schedule-time">
                          {formatTime(game.closeTime)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="game-status">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={status.locked ? "locked" : "unlocked"}
                      className="status-message"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {status.locked ? status.lockMsg : "Open for Play"}
                    </motion.div>
                  </AnimatePresence>

                  {status.locked ? (
                    <motion.button
                      className="action-btn locked"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <FaLock /> Locked
                    </motion.button>
                  ) : (
                    <motion.button
                      className="action-btn"
                      onClick={() =>
                        navigate("/numbers", { state: { game: game.name } })
                      }
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 5px 15px rgba(255, 255, 255, 0.2)",
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Play Now <FaArrowRight />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Card Border Animation */}
              <div className="card-border"></div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Boxes;