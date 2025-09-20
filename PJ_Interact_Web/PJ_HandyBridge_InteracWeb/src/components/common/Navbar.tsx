// src/components/common/Navbar.tsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaAngleDown } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import ProfileSidebar from "./ProfileSidebar";
import "./Navbar.css";

interface NavbarProps {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

export default function Navbar_Handy({
  onLoginClick,
  onRegisterClick,
}: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);

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

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    profile?.full_name || "User"
  )}&background=4b648b&color=fff&size=100`;

  return (
    <>
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
          <a href="#" className="nav-link">
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
          {profile ? (
            <div className="user-menu">
              <span className="profile-name">{profile.full_name}</span>
              <button
                className="profile-avatar-btn"
                onClick={() => setShowProfileSidebar(true)}
              >
                <img
                  src={profile.avatar_url || defaultAvatar}
                  alt="Profile"
                  className="profile-avatar-img"
                />
              </button>
            </div>
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

      {profile && (
        <ProfileSidebar
          isOpen={showProfileSidebar}
          onClose={() => setShowProfileSidebar(false)}
          profile={profile}
        />
      )}
    </>
  );
}
