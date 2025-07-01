import "./MyProfile.css";
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import API from "../../../api/axiosSetup";

const ProfilePage = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [wallet, setWallet] = useState({
    balance: "0.00",
    bonus: "0.00",
    winnings: "0.00",
  });
  const [copyStatus, setCopyStatus] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };
        const [profileRes, walletRes] = await Promise.all([
          API.get("profile/", { headers }),
          API.get("balance/", { headers }),
        ]);
        setUser(profileRes.data);
        setWallet(walletRes.data);
      } catch (err) {
        console.error("Failed to load profile or balance", err);
      }
    };
    fetchProfile();
  }, []);

  // Copy referral code handler
  const handleCopyReferral = () => {
    const code = user.referral_code || "";
    navigator.clipboard.writeText(code).then(() => {
      setCopyStatus("Copied!");
      setTimeout(() => setCopyStatus(""), 1500);
    });
  };

  // Edit profile handlers
  const openEdit = () => {
    setEditName(user.username || "");
    setEditEmail(user.email || "");
    setEditMode(true);
    setEditError("");
    setEditSuccess("");
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setEditError("");
    setEditSuccess("");
    if (!editName && !editEmail) {
      setEditError("Please enter Name or Email to update.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {};
      if (editName && editName !== user.username) payload.username = editName;
      if (editEmail && editEmail !== user.email) payload.email = editEmail;
      if (Object.keys(payload).length === 0) {
        setEditError("No changes to update.");
        return;
      }
      const res = await API.post("edit_profile/", payload, { headers });
      setUser((prev) => ({
        ...prev,
        username: res.data.username,
        email: res.data.email,
      }));
      setEditSuccess("Profile updated successfully!");
      setEditMode(false);
    } catch (err) {
      setEditError(
        err.response?.data?.error || "Failed to update profile. Try again."
      );
    }
  };

  return (
    <div className="profile-container">
      <div id="floatingCoins" className="animated-coins"></div>
      <header className="profile-header">
        <div className="header-content">
          <h1 className="profile-title">MY PROFILE</h1>
          <p className="profile-subtitle">Track your progress and earnings</p>
          <div className="profile-glow"></div>
        </div>
      </header>

      <div className="profile-card">
        <div className="profile-section">
          <h2 className="section-title">
            <i className="fas fa-user"></i> Personal Information
          </h2>
          <div className="user-info">
            <div className="user-avatar-container">
              <div className="user-avatar-initials">
                {user.username
                  ? (() => {
                      const words = user.username.trim().split(/\s+/);
                      if (words.length >= 2) {
                        return (
                          words[0].charAt(0).toUpperCase() +
                          words[1].charAt(0).toUpperCase()
                        );
                      } else if (words.length === 1 && words[0].length > 0) {
                        return words[0].charAt(0).toUpperCase();
                      } else {
                        return "X";
                      }
                    })()
                  : "X"}
              </div>
            </div>
            <div className="user-details">
              <div className="detail-label">Name</div>
              <div className="user-name">{user.username || "..."}</div>
              <div className="detail-row">
                <div className="detail-label">Phone:</div>
                <div className="detail-value">{user.mobile || "..."}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Email:</div>
                <div className="detail-value">{user.email || "..."}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Referral Code:</div>
                <div className="detail-value">
                  {user.referral_code || "..."}
                  <button
                    className="copy-btn"
                    onClick={handleCopyReferral}
                    style={{ marginLeft: 10 }}
                  >
                    <i className="fas fa-copy"></i>
                  </button>
                  <span
                    style={{
                      marginLeft: 10,
                      color: "#4caf50",
                      fontWeight: 600,
                    }}
                  >
                    {copyStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Popup */}
          {editMode && (
            <div
              className="edit-profile-modal"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}
            >
              <form
                className="edit-profile-form"
                onSubmit={handleEditProfile}
                style={{
                  background: "rgba(88, 108, 114, 0.95)",
                  padding: "32px 24px",
                  borderRadius: "12px",
                  minWidth: 320,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                  position: "relative",
                }}
              >
                <h3 style={{ margin: 0, marginBottom: 8, color: "#222" }}>
                  Edit Profile
                </h3>
                <label
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  Name:
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter name"
                  />
                </label>
                <label
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  Email:
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="Enter email"
                  />
                </label>
                {editError && (
                  <div
                    className="edit-error"
                    style={{ color: "red", fontSize: 14 }}
                  >
                    {editError}
                  </div>
                )}
                {editSuccess && (
                  <div
                    className="edit-success"
                    style={{ color: "green", fontSize: 14 }}
                  >
                    {editSuccess}
                  </div>
                )}
                <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                  <button
                    type="submit"
                    className="save-btn"
                    style={{
                      background: "#4caf50",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      padding: "8px 18px",
                      cursor: "pointer",
                    }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setEditMode(false)}
                    style={{
                      background: "#eee",
                      color: "#222",
                      border: "none",
                      borderRadius: 4,
                      padding: "8px 18px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* KYC & Logout */}
          <div className="detail-row" style={{ marginTop: 20 }}>
            <div className="detail-label">KYC Status:</div>
            <div className="detail-value">
              <span className="kyc-status">VERIFIED</span>
              <button className="edit-button" onClick={openEdit}>
                <i className="fas fa-edit"></i> Edit
              </button>
            </div>
            <Link to="/verification" className="kyc-button">
              <i className="fas fa-id-card"></i> Complete KYC
            </Link>
          </div>
        </div>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        <i className="fas fa-sign-out-alt"></i> LOGOUT
      </button>
    </div>
  );
};

export default ProfilePage;
