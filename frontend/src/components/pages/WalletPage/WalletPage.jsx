import './WalletPage.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

const WalletPage = () => {
  const [wallet, setWallet] = useState({
    balance: '0.00',
    bonus: '0.00',
    winnings: '0.00',
    withdrawable_balance: '0.00',
  });

  const [referralBonus, setReferralBonus] = useState({
    direct_bonus: '0.00',
    commission_earned: '0.00',
  });

  const getTotalBalance = () => {
    const deposit = parseFloat(wallet.balance) || 0;
    const bonus = parseFloat(wallet.bonus) || 0;
    const winnings = parseFloat(wallet.winnings) || 0;
    return (deposit + bonus + winnings).toFixed(2);
  };

  // ✅ Only direct_bonus + commission_earned
  const getTotalBonusAmount = () => {
    const directBonus = parseFloat(referralBonus.direct_bonus) || 0;
    const commission = parseFloat(referralBonus.commission_earned) || 0;
    return (directBonus + commission).toFixed(2);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [walletRes, referralRes] = await Promise.all([
          axios.get("https://stproject1.onrender.com/api/balance/", { headers }),
          axios.get("https://stproject1.onrender.com/api/user/my-referrals/", { headers }),
        ]);

        setWallet(walletRes.data);
        setReferralBonus({
          direct_bonus: referralRes.data.direct_bonus || '0.00',
          commission_earned: referralRes.data.commission_earned || '0.00',
        });
      } catch (error) {
        console.error("Error fetching wallet/referral data", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <div id="floatingCoins"></div>

      <header className="wallet-header">
        <h1 className="wallet-title">MY WALLET</h1>
      </header>

      <div className="kyc-btn-container">
        <Link to="/verification" className="kyc-button">
          <i className="fas fa-id-card"></i> COMPLETE KYC
        </Link>
      </div>

      <div className="wallet-card">
        <div className="balance-section">
          <div className="balance-label">TOTAL BALANCE</div>
          <div className="total-balance">₹{getTotalBalance()}</div>
          <div className="balance-subtext">Total amount</div>
        </div>

        <div className="amount-cards">
          <div className="amount-card deposit-amount">
            <div className="amount-label">WINNINGS AMOUNT</div>
            <div className="amount-value">₹{wallet.winnings}</div>
            <div className="amount-subtext">Available for withdrawal</div>
          </div>

          <div className="amount-card winnings-amount">
            <div className="amount-label">BONUS AMOUNT</div>
            <div className="amount-value">₹{getTotalBonusAmount()}</div>
            <div className="amount-subtext">
              Includes direct bonus + commission earned
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <Link to="/addchips" className="action-btn deposit-btn">
            <i className="fas fa-rupee-sign"></i> ADD CASH
          </Link>

          <Link to="/withdrawchips" className="action-btn withdraw-btn">
            <i className="fas fa-wallet"></i> WITHDRAW
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;