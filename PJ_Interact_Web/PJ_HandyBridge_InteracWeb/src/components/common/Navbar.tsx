// src/components/common/Navbar.tsx
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaAngleDown } from "react-icons/fa";
import "./Navbar.css";

interface NavbarProps {
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

export default function Navbar_Handy({
  isLoggedIn = false,
  onLoginClick,
  onRegisterClick,
}: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // ถ้าอยู่ในหน้า auth ให้ใช้ function ที่ส่งมา
  // ถ้าไม่ใช่ให้ navigate ไปพร้อม query string
  const handleLoginClick = () => {
    if (location.pathname === "/auth" && onLoginClick) {
      onLoginClick();
    } else {
      navigate("/auth?mode=login");
    }
  };

  const handleRegisterClick = () => {
    if (location.pathname === "/auth" && onRegisterClick) {
      onRegisterClick();
    } else {
      navigate("/auth?mode=register");
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <img
          src="/src/assets/logo/logo_handy1.png"
          alt="Handy Bridge Logo"
          className="logo-icon"
        />
        <span className="logo-text">Handy Bridge</span>
      </Link>

      <div className="navbar-menu">
        <a href="#" className="nav-link">
          เรียนรู้ <FaAngleDown className="dropdown-icon" />
        </a>
        <a href="#" className="nav-link active">
          เก็บกำไร <FaAngleDown className="dropdown-icon" />
        </a>
        <a href="#" className="nav-link">
          ช่วยเหลือ <FaAngleDown className="dropdown-icon" />
        </a>
        <a href="#" className="nav-link">
          ร่วมพัฒนา <FaAngleDown className="dropdown-icon" />
        </a>
      </div>

      <div className="navbar-profile">
        {isLoggedIn ? (
          <>
            <span className="profile-name">นาม สมมติ</span>
            <div className="profile-avatar">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400"
                alt="Profile"
              />
            </div>
          </>
        ) : (
          <div className="auth-buttons">
            <button className="login-btn" onClick={handleLoginClick}>
              เข้าสู่ระบบ
            </button>
            <button className="register-btn" onClick={handleRegisterClick}>
              สมัครสมาชิก
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
