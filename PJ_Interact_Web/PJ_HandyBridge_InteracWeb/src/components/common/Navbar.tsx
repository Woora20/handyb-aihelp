// src/components/common/Navbar.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaAngleDown } from "react-icons/fa";
import { PiArrowCircleRightFill } from "react-icons/pi";
import { RxHamburgerMenu } from "react-icons/rx";
import { TfiClose } from "react-icons/tfi";
import { MdLogout } from "react-icons/md";
import { useAuth } from "../../contexts/AuthContext";
import ProfileSidebar from "./ProfileSidebar";
import "./Navbar.css";

interface NavbarProps {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

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
  const { profile, signOut } = useAuth();
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLoginClick = () => {
    if (location.pathname === "/auth" && onLoginClick) {
      onLoginClick();
    } else {
      navigate("/auth?mode=login");
    }
    setMobileMenuOpen(false);
  };

  const handleRegisterClick = () => {
    if (location.pathname === "/auth" && onRegisterClick) {
      onRegisterClick();
    } else {
      navigate("/auth?mode=register");
    }
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileActiveMenu(null);
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    profile?.full_name || "User"
  )}&background=4b648b&color=fff&size=100`;

  return (
    <>
      <div
        className={`mobile-backdrop ${mobileMenuOpen ? "active" : ""}`}
        onClick={closeMobileMenu}
      />

      <nav className={`navbar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="navbar-container">
          <Link to="/" className="logo">
            <img
              src="/src/assets/logo/logo_handy1.png"
              alt="Handy Bridge Logo"
              className="logo-icon"
            />
            <span className="logo-text">Handy Bridge</span>
          </Link>

          <div className="navbar-menu">
            {Object.entries(menuItems).map(([key, items]) => (
              <div
                key={key}
                className="nav-item-wrapper"
                onMouseEnter={() => setActiveDropdown(key)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="nav-link">
                  {key}
                  <FaAngleDown className="dropdown-icon" />
                </button>

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
                        <span>{item.title}</span>
                        <PiArrowCircleRightFill className="dropdown-arrow-icon" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
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

          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <TfiClose /> : <RxHamburgerMenu />}
          </button>
        </div>

        <div className="mobile-menu-dropdown">
          {profile && (
            <div className="mobile-profile">
              <img
                src={profile.avatar_url || defaultAvatar}
                alt="Profile"
                className="mobile-profile-avatar"
              />
              <div className="mobile-profile-info">
                <p className="mobile-profile-name">
                  ชื่อ-สกุล: {profile.full_name}
                </p>
                <p className="mobile-profile-email">อีเมล: {profile.email}</p>
              </div>
            </div>
          )}

          <div className="mobile-menu-list">
            {Object.entries(menuItems).map(([key, items]) => (
              <div key={key} className="mobile-menu-item">
                <button
                  className="mobile-menu-button"
                  onClick={() =>
                    setMobileActiveMenu(mobileActiveMenu === key ? null : key)
                  }
                >
                  {key}
                  <FaAngleDown
                    className={`mobile-arrow ${
                      mobileActiveMenu === key ? "rotate" : ""
                    }`}
                  />
                </button>
                <div
                  className={`mobile-submenu ${
                    mobileActiveMenu === key ? "open" : ""
                  }`}
                >
                  {items.map((item, index) => (
                    <Link
                      key={index}
                      to={item.path}
                      className={`mobile-submenu-link ${
                        location.pathname === item.path ? "active" : ""
                      }`}
                      onClick={closeMobileMenu}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* Auth Links Inside Menu List */}
            {!profile && (
              <div className="mobile-menu-item">
                <div className="mobile-auth">
                  <span
                    className="mobile-auth-link"
                    onClick={handleRegisterClick}
                  >
                    สมัครสมาชิก
                  </span>
                  <span className="mobile-auth-divider">|</span>
                  <span className="mobile-auth-link" onClick={handleLoginClick}>
                    เข้าสู่ระบบ
                  </span>
                </div>
              </div>
            )}
          </div>

          {profile && (
            <button className="mobile-logout" onClick={handleSignOut}>
              ออกจากระบบ <MdLogout />
            </button>
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
