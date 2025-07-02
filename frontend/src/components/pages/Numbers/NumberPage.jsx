import React, { useState, useEffect } from "react";
import "./NumberPage.css";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function NumberPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const gameName = location.state?.game || "unknown";

  const [selectedNumbers, setSelectedNumbers] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [currentAmount, setCurrentAmount] = useState("");
  const [highlightNumbers, setHighlightNumbers] = useState(false);
  const [activeSection, setActiveSection] = useState("all");
  const [errorMsg, setErrorMsg] = useState(""); // Error message for popup

  const standardAmounts = [10, 50, 100, 300, 500, 1000];
  const allNumbers = Array.from({ length: 100 }, (_, i) => i + 1);
  const andarNumbers = Array.from({ length: 10 }, (_, i) => i);
  const baharNumbers = Array.from({ length: 10 }, (_, i) => i);

  const MIN_BET = 10;
  const MAX_BET = 10000;

  const openAmountPopup = (number, section) => {
    setCurrentSelection({ number, section });
    const key = `${number}-${section}`;
    const existing = selectedNumbers[key];
    setCurrentAmount(existing?.amount || "");
    setErrorMsg(""); // clear error on open
    setShowPopup(true);
  };

  const closeAmountPopup = () => {
    setShowPopup(false);
    setCurrentSelection(null);
    setCurrentAmount("");
    setErrorMsg("");
  };

  const confirmAmount = (amount) => {
    const amt = Number(amount);
    if (
      currentSelection &&
      amt >= MIN_BET &&
      amt <= MAX_BET &&
      Number.isInteger(amt)
    ) {
      const key = `${currentSelection.number}-${currentSelection.section}`;
      setSelectedNumbers((prev) => ({
        ...prev,
        [key]: {
          amount: amt,
          section: currentSelection.section,
          number: currentSelection.number,
        },
      }));
      setErrorMsg("");
      closeAmountPopup();
    } else {
      setErrorMsg(
        `Bet amount must be between ₹${MIN_BET} and ₹${MAX_BET} (whole number).`
      );
    }
  };

  const removeNumber = (key) => {
    const newSelected = { ...selectedNumbers };
    delete newSelected[key];
    setSelectedNumbers(newSelected);
  };

  const clearAll = () => {
    setSelectedNumbers({});
    setHighlightNumbers(false);
  };

  const placeBet = async () => {
    const totalNumbers = Object.keys(selectedNumbers).length;
    if (totalNumbers === 0) {
      alert("Please select at least one number!");
      return;
    }

    // Secure: All bet amounts must be valid
    for (const key in selectedNumbers) {
      const amt = selectedNumbers[key].amount;
      if (amt < MIN_BET || amt > MAX_BET || !Number.isInteger(amt)) {
        alert(
          `Bet amount for number ${selectedNumbers[key].number} must be between ₹${MIN_BET} and ₹${MAX_BET} (whole number).`
        );
        return;
      }
    }

    const token = localStorage.getItem("token");
    try {
      for (const key in selectedNumbers) {
        const bet = selectedNumbers[key];
        const payload = {
          game_name: gameName,
          number: bet.number,
          bet_type: bet.section === "all" ? "number" : bet.section,
          amount: bet.amount,
        };

        await axios.post("https://stproject1.onrender.com/api/place-bet/", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // Navigate to success page with bet summary
      navigate("/ordersuccess", {
        state: {
          game: gameName,
          numbers: Object.values(selectedNumbers).map((n) => n.number),
          amount: totalAmount,
        },
      });
    } catch (error) {
      console.error("Bet API error:", error);
      alert("Bet failed: " + (error.response?.data?.error || "Server error"));
    }
  };

  const totalAmount = Object.values(selectedNumbers).reduce(
    (sum, num) => sum + num.amount,
    0
  );

  const isSelected = (number, section) => {
    return !!selectedNumbers[`${number}-${section}`];
  };

  useEffect(() => {
    const addGlowEffect = () => {
      const cells = document.querySelectorAll(".number-cell");
      cells.forEach((cell) => {
        cell.addEventListener("mouseover", () => {
          cell.style.transform = "scale(1.1) translateY(-5px)";
          cell.style.boxShadow = "0 10px 20px rgba(0, 243, 255, 0.4)";
        });
        cell.addEventListener("mouseout", () => {
          cell.style.transform = "scale(1) translateY(0)";
          cell.style.boxShadow = "none";
        });
      });
    };
    addGlowEffect();
  }, []);

  return (
    <div className="num-container">
      <div className="cyber-glitch"></div>
      <h1>{gameName.toUpperCase()} NUMBER SELECTION</h1>

      <div className="section-tabs">
        <button
          className={`tab-btn ${activeSection === "all" ? "active" : ""}`}
          onClick={() => setActiveSection("all")}
        >
          All Numbers (1-100)
        </button>
        <button
          className={`tab-btn ${activeSection === "andar" ? "active" : ""}`}
          onClick={() => setActiveSection("andar")}
        >
          Andar (0-9)
        </button>
        <button
          className={`tab-btn ${activeSection === "bahar" ? "active" : ""}`}
          onClick={() => setActiveSection("bahar")}
        >
          Bahar (0-9)
        </button>
      </div>

      {activeSection === "all" && (
        <div className="number-grid">
          {allNumbers.map((number) => (
            <div
              key={number}
              className={`number-cell ${
                isSelected(number, "all") ? "selected" : ""
              } ${
                highlightNumbers && isSelected(number, "all") ? "highlight" : ""
              }`}
              onClick={() => openAmountPopup(number, "all")}
            >
              {number}
            </div>
          ))}
        </div>
      )}

      {activeSection === "andar" && (
        <div className="section-container">
          <h2 className="section-title">Andar Numbers (0-9)</h2>
          <div className="section-number-grid">
            {andarNumbers.map((number) => (
              <div
                key={`andar-${number}`}
                className={`number-cell andar ${
                  isSelected(number, "andar") ? "selected" : ""
                } ${
                  highlightNumbers && isSelected(number, "andar")
                    ? "highlight"
                    : ""
                }`}
                onClick={() => openAmountPopup(number, "andar")}
              >
                {number}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === "bahar" && (
        <div className="section-container">
          <h2 className="section-title">Bahar Numbers (0-9)</h2>
          <div className="section-number-grid">
            {baharNumbers.map((number) => (
              <div
                key={`bahar-${number}`}
                className={`number-cell bahar ${
                  isSelected(number, "bahar") ? "selected" : ""
                } ${
                  highlightNumbers && isSelected(number, "bahar")
                    ? "highlight"
                    : ""
                }`}
                onClick={() => openAmountPopup(number, "bahar")}
              >
                {number}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="controls">
        <div className="selected-numbers">
          <h3>Your Selected Numbers:</h3>
          <div className="selected-list">
            {Object.entries(selectedNumbers).map(([key, data]) => (
              <div key={key} className={`selected-item ${data.section}`}>
                {data.number}
                {data.section === "andar" && (
                  <span className="section-mark">A</span>
                )}
                {data.section === "bahar" && (
                  <span className="section-mark">B</span>
                )}
                <span className="amount">₹{data.amount}</span>
                <span className="remove" onClick={() => removeNumber(key)}>
                  ×
                </span>
              </div>
            ))}
          </div>
        </div>
        <hr />
        <div className="control-group">
          <label>Total Bet Amount</label>
          <input type="text" readOnly value={`₹${totalAmount}`} />
        </div>
        <button className="btn" onClick={placeBet}>
          Place Bet
        </button>
        <button className="btn btn-danger" onClick={clearAll}>
          Clear All
        </button>
      </div>

      <div className="summary">
        <h3>BET SUMMARY</h3>
        <div className="summary-item">
          <span>Total Numbers Selected:</span>
          <span>{Object.keys(selectedNumbers).length}</span>
        </div>
        <div className="summary-item">
          <span>Total Bet Amount:</span>
          <span>₹{totalAmount}</span>
        </div>
      </div>

      {showPopup && (
        <div className="amount-popup">
          <h3>
            Select Amount for Number <span>{currentSelection?.number}</span>
          </h3>
          <div className="amount-options">
            {standardAmounts.map((amt) => (
              <button
                key={amt}
                className={`amount-btn ${
                  Number(currentAmount) === amt ? "active" : ""
                }`}
                onClick={() => setCurrentAmount(amt)}
              >
                ₹{amt}
              </button>
            ))}
          </div>
          <div className="custom-amount">
            <input
              type="number"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder={`Enter custom amount (${MIN_BET}-${MAX_BET})`}
              min={MIN_BET}
              max={MAX_BET}
              step={1}
            />
          </div>
          {/* Error message show here */}
          {errorMsg && (
            <div style={{ color: "red", margin: "8px 0", fontWeight: "bold" }}>
              {errorMsg}
            </div>
          )}
          <div className="popup-buttons">
            <button className="popup-btn cancel-btn" onClick={closeAmountPopup}>
              Cancel
            </button>
            <button
              className="popup-btn confirm-btn"
              onClick={() => confirmAmount(currentAmount)}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
      {showPopup && <div className="overlay"></div>}
    </div>
  );
}

export default NumberPage;