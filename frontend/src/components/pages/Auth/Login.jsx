import React, { useState } from "react";
import { FaMobileAlt, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

const Login = () => {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [blocked, setBlocked] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Form validation
    if (!mobile.trim()) {
      setError("Mobile number is required");
      return;
    }

    if (mobile.length !== 10) {
      setError("Mobile number must be exactly 10 digits");
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      setError("Mobile number must contain only digits");
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      const response = await axios.post(
        "https://stproject1.onrender.com/api/login/",
        {
          mobile,
          password,
        }
      );

      localStorage.setItem("token", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/wallet");
    } catch (err) {
      if (err.response?.data?.blocked) {
        setError("Your ID is blocked. Please contact support.");
        setBlocked(true);
      } else if (err.response?.status === 401) {
        setError("Invalid mobile number or password.");
        setBlocked(false);
      } else {
        setError("Login failed. Please try again later.");
        setBlocked(false);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Login</h2>
          <p>Enter your mobile number to access your account</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <div className="input-icon">
              <FaMobileAlt />
            </div>
            <input
              type="tel"
              placeholder="Mobile Number"
              maxLength="10"
              pattern="[0-9]{10}"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <div className="input-icon">
              <FaLock />
            </div>
            <input
              type="password"
              placeholder="Password"
              minLength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
              {blocked && (
                <div>
                  <a href="/contact-us" className="contact-link">
                    Contact Us
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" /> Remember me
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Forgot Password?
            </Link>
          </div>
          <button type="submit" className="auth-btn">
            Login
          </button>
          <div className="auth-footer">
            <p>
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
