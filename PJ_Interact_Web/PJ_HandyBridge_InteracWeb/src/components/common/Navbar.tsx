// src/components/common/Navbar.tsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaAngleDown } from "react-icons/fa";
import { PiArrowCircleRightFill } from "react-icons/pi";
import { useAuth } from "../../contexts/AuthContext";
import ProfileSidebar from "./ProfileSidebar";
import "./Navbar.css";

interface NavbarProps {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

// Menu Structure
const menuItems = {
  เรียนรู้: [
    { title: "ค้นหาภาษามือ", path: "/search" },
    { title: "AI ตอบคำถาม", path: "/ai-assistant" },
    { title: "ฝึกฝนภาษามือ", path: "/practice" },
  ],
  เกี่ยวกับเรา: [{ title: "วัตถุประสงค์", path: "/purpose" }],
  ช่วยเหลือ: [
    { title: "คำถามที่พบบ่อย", path: "/faq" },
    { title: "ข่าวสาร", path: "/news" },
  ],
  ร่วมพัฒนา: [
    { title: "ส่งคำศัพท์ใหม่", path: "/submit-word" },
    { title: "รีวิวเว็บไซต์", path: "/review" },
  ],
};

export default function Navbar_Handy({
  onLoginClick,
  onRegisterClick,
}: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Handle Auth Actions
  const handleLoginClick = () => {
    location.pathname === "/auth" && onLoginClick
      ? onLoginClick()
      : navigate("/auth?mode=login");
  };

  const handleRegisterClick = () => {
    location.pathname === "/auth" && onRegisterClick
      ? onRegisterClick()
      : navigate("/auth?mode=register");
  };

  // Handle Dropdown
  const handleMouseEnter = (menu: string) => setActiveDropdown(menu);
  const handleMouseLeave = () => setActiveDropdown(null);

  // Default Avatar
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    profile?.full_name || "User"
  )}&background=4b648b&color=fff&size=100`;

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <Link to="/" className="logo">
          <img
            src="/src/assets/logo/logo_handy1.png"
            alt="Handy Bridge Logo"
            className="logo-icon"
          />
          <span className="logo-text">Handy Bridge</span>
        </Link>

        {/* Navigation Menu */}
        <div className="navbar-menu">
          {Object.entries(menuItems).map(([key, items]) => (
            <div
              key={key}
              className="nav-item-wrapper"
              onMouseEnter={() => handleMouseEnter(key)}
              onMouseLeave={handleMouseLeave}
            >
              <button className="nav-link">
                {key}
                <FaAngleDown className="dropdown-icon" />
              </button>

              {/* Dropdown Menu */}
              <div
                className={`dropdown-menu ${
                  activeDropdown === key ? "active" : ""
                }`}
              >
                <div className="dropdown-content">
                  {items.map((item, index) => (
                    <Link
                      key={index}
                      to={item.path}
                      className={`dropdown-item ${
                        location.pathname === item.path ? "active" : ""
                      }`}
                      onClick={() => setActiveDropdown(null)}
                    >
                      <span className="dropdown-text">{item.title}</span>
                      <PiArrowCircleRightFill className="dropdown-arrow-icon" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Profile/Auth Section */}
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

      {/* Profile Sidebar */}
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
