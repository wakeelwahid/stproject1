import "./App.css";
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WhatsAppButton from "./components/WhatsAppButton/WhatsAppButton";
import GameAnimations from "./components/GameAnimations";
import Header from "./components/header/Header";
import Footer from "./components/Footer/Footer";
import TopSection from "./components/top-section/Top_Section";
import Boxes from "./components/Boxes/Boxes";
import MyProfile from "./components/pages/MyProfile/MyProfile";
import WalletPage from "./components/pages/WalletPage/WalletPage";
import Refers from "./components/pages/Refers/Refers";
import SupportPage from "./components/pages/SupportPage/SupportPage";
import PrivacyPolicy from "./components/pages/PrivacyPolicy/PrivacyPolicy";
import RefundPolicy from "./components/pages/RefundPolicy/RefundPolicy";
import TransactionsPage from "./components/pages/Transactions/Transactions";
import GameHistory from "./components/pages/GameHistory/GameHistory";
import TermsConditions from "./components/pages/TermsConditions/TermsConditions";
import GameRules from "./components/pages/GameRules/GameRules";
import AddChips from "./components/pages/WalletPage/Add-withdraw/AddChips";
import WithdrawChips from "./components/pages/WalletPage/Add-withdraw/WithdrawChips";
import PaymentPage from "./components/pages/WalletPage/Payment/PaymentPage";
import Dashboard from "./components/pages/Dashboard/Dashboard";
import NumberPage from "./components/pages/Numbers/NumberPage";
import BetSuccessPage from "./components/pages/BetSuccess/BetSuccessPage";
import MyBet from "./components/pages/MyBet/MyBet";
import Verification from "./components/pages/Verification/KYCVerification";
import AddChipsSuccess from "./components/pages/AddChipsSuccess/AddChipsSuccess";
import WithdrawalChipsSuccess from "./components/pages/WithdrawalChipsSuccess/WithdrawalChipsSuccess";
import Login from "./components/pages/Auth/Login";
import Register from "./components/pages/Auth/Register";
import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminLogin from "./components/Admin/AdminLogin";
import AgeVerification from "./components/AgeVerification/AgeVerification";
import AuthGuard from "./components/AuthGuard/AuthGuard";

import API from "./api/axiosSetup";

const BlockedPopup = () => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.95)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      flexDirection: "column",
    }}
  >
    <h2 style={{ marginBottom: 16 }}>Aapko block kr diya gya hai</h2>
    <p style={{ marginBottom: 24 }}>
      Aapka account block hai. Contact kare support team se.
    </p>
    <a
      href="mailto:support@example.com"
      style={{
        background: "#fff",
        color: "#222",
        padding: "10px 24px",
        borderRadius: 6,
        textDecoration: "none",
        fontWeight: 600,
      }}
    >
      Contact Us
    </a>
  </div>
);

function App() {
  const [ageVerified, setAgeVerified] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setChecked(true);
        return;
      }
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const res = await API.get("profile/", { headers });
        if (res.data.status === "blocked") {
          setBlocked(true);
          localStorage.removeItem("token");
        }
      } catch (err) {
        // Agar backend se 403/401 aaye toh bhi block dikhao
        if (err.response && err.response.status === 403) setBlocked(true);
      }
      setChecked(true);
    };
    checkStatus();
  }, []);

  if (!checked) return null; // Jab tak check nahi hua, kuch bhi mat dikhao

  if (blocked) return <BlockedPopup />;

  const handleAgeConfirm = () => {
    setAgeVerified(true);
  };

  if (!ageVerified) {
    return <AgeVerification onConfirm={handleAgeConfirm} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
        <Route
          path="/*"
          element={
            <AuthGuard>
              <GameAnimations />
              <Header />
              <Routes>
                <Route
                  path="/"
                  element={
                    <>
                      <TopSection />
                      <Boxes />
                    </>
                  }
                />
                <Route path="/boxes" element={<Boxes />} />
                <Route path="/Dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<MyProfile />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/refer" element={<Refers />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/refund" element={<RefundPolicy />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/history" element={<GameHistory />} />
                <Route path="/terms" element={<TermsConditions />} />
                <Route path="/addchips" element={<AddChips />} />
                <Route path="/withdrawchips" element={<WithdrawChips />} />
                <Route path="/purchasechips" element={<PaymentPage />} />
                <Route path="/numbers" element={<NumberPage />} />
                <Route path="/ordersuccess" element={<BetSuccessPage />} />
                <Route path="/mychips" element={<MyBet />} />
                <Route path="/play" element={<Boxes />} />
                <Route path="/verification" element={<Verification />} />
                <Route path="/addchipssuccess" element={<AddChipsSuccess />} />
                <Route
                  path="/withdrawalchipssuccess"
                  element={<WithdrawalChipsSuccess />}
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/game-rules" element={<GameRules />} />
              </Routes>
              <Footer />
              <WhatsAppButton />
            </AuthGuard>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
