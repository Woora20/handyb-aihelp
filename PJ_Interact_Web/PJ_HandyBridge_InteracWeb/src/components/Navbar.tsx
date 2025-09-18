import React from "react";
import { FaAngleDown } from "react-icons/fa";
import "./Navbar.css";

interface NavbarProps {
  isLoggedIn?: boolean;
}

export default function Navbar_Handy({ isLoggedIn = false }: NavbarProps) {
  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => handleNavigation("/")}>
        <img
          src="/src/assets/logo/logo_handy1.png"
          alt="Handy Bridge Logo"
          className="logo-icon"
        />
        <span className="logo-text">Handy Bridge</span>
      </div>

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
            <button
              className="login-btn"
              onClick={() => handleNavigation("/login")}
            >
              เข้าสู่ระบบ
            </button>
            <button
              className="register-btn"
              onClick={() => handleNavigation("/register")}
            >
              สมัครสมาชิก
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
