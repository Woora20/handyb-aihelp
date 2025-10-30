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
import EditProfileModal from "../profile/EditProfileModal";
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    if (mobileMenuOpen || showProfileSidebar || showEditModal) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [mobileMenuOpen, showProfileSidebar, showEditModal]);

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
    try {
      await signOut();
      setMobileMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileActiveMenu(null);
  };

  const handleMobileAvatarClick = () => {
    setShowEditModal(true);
    setMobileMenuOpen(false);
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    profile?.full_name || "User"
  )}&background=4b648b&color=fff&size=100`;

  return (
    <>
      <div
        className={`mobile-backdrop ${mobileMenuOpen ? "active" : ""}`}
        onClick={closeMobileMenu}
        role="presentation"
        aria-hidden={!mobileMenuOpen}
      />

      <nav className={`navbar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="navbar-container">
          <Link to="/" className="logo" aria-label="Handy Bridge Home">
            <img
              src="/logo/logo_handy1.png"
              alt="Handy Bridge Logo"
              className="logo-icon"
              width="32"
              height="32"
            />
            <span className="logo-text">Handy Bridge</span>
          </Link>

          {/* Desktop Menu */}
          <div className="navbar-menu" role="navigation" aria-label="Main">
            {Object.entries(menuItems).map(([key, items]) => (
              <div
                key={key}
                className="nav-item-wrapper"
                onMouseEnter={() => setActiveDropdown(key)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  className="nav-link"
                  aria-label={key}
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === key}
                  type="button"
                >
                  {key}
                  <FaAngleDown className="dropdown-icon" aria-hidden="true" />
                </button>

                <div
                  className={`dropdown-menu ${
                    activeDropdown === key ? "active" : ""
                  }`}
                  role="menu"
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
                        role="menuitem"
                      >
                        <span>{item.title}</span>
                        <PiArrowCircleRightFill
                          className="dropdown-arrow-icon"
                          aria-hidden="true"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Profile */}
          <div className="navbar-profile">
            {profile ? (
              <div className="user-menu">
                <span className="profile-name">{profile.full_name}</span>
                <button
                  className="profile-avatar-btn"
                  onClick={() => setShowProfileSidebar(true)}
                  aria-label="Open Profile"
                  type="button"
                >
                  <img
                    src={profile.avatar_url || defaultAvatar}
                    alt=""
                    className="profile-avatar-img"
                    width="50"
                    height="50"
                  />
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button
                  className="login-btn"
                  onClick={handleLoginClick}
                  type="button"
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  className="register-btn"
                  onClick={handleRegisterClick}
                  type="button"
                >
                  สมัครสมาชิก
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            aria-expanded={mobileMenuOpen}
            type="button"
          >
            {mobileMenuOpen ? <TfiClose /> : <RxHamburgerMenu />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className="mobile-menu-dropdown"
          role="navigation"
          aria-label="Mobile"
        >
          {/* Mobile Profile Section */}
          {profile && (
            <div className="mobile-profile">
              <img
                src={profile.avatar_url || defaultAvatar}
                alt=""
                className="mobile-profile-avatar"
                onClick={handleMobileAvatarClick}
                style={{ cursor: "pointer" }}
                width="72"
                height="72"
                loading="lazy"
              />
              <div className="mobile-profile-info">
                <p className="mobile-profile-name">
                  ชื่อ-สกุล: {profile.full_name}
                </p>
                <p className="mobile-profile-email">อีเมล: {profile.email}</p>
              </div>
            </div>
          )}

          {/* Mobile Menu Items */}
          <div className="mobile-menu-list">
            {Object.entries(menuItems).map(([key, items]) => (
              <div key={key} className="mobile-menu-item">
                <button
                  className="mobile-menu-button"
                  onClick={() =>
                    setMobileActiveMenu(mobileActiveMenu === key ? null : key)
                  }
                  aria-expanded={mobileActiveMenu === key}
                  aria-haspopup="true"
                  type="button"
                >
                  {key}
                  <FaAngleDown
                    className={`mobile-arrow ${
                      mobileActiveMenu === key ? "rotate" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <div
                  className={`mobile-submenu ${
                    mobileActiveMenu === key ? "open" : ""
                  }`}
                  role="menu"
                >
                  {items.map((item, index) => (
                    <Link
                      key={index}
                      to={item.path}
                      className={`mobile-submenu-link ${
                        location.pathname === item.path ? "active" : ""
                      }`}
                      onClick={closeMobileMenu}
                      role="menuitem"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* Mobile Auth Links */}
            {!profile && (
              <div className="mobile-menu-item">
                <div className="mobile-auth">
                  <button
                    className="mobile-auth-link"
                    onClick={handleRegisterClick}
                    style={{ background: "none", border: "none", padding: 0 }}
                    type="button"
                  >
                    สมัครสมาชิก
                  </button>
                  <span className="mobile-auth-divider">|</span>
                  <button
                    className="mobile-auth-link"
                    onClick={handleLoginClick}
                    style={{ background: "none", border: "none", padding: 0 }}
                    type="button"
                  >
                    เข้าสู่ระบบ
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Logout Button */}
          {profile && (
            <button
              className="mobile-logout"
              onClick={handleSignOut}
              type="button"
            >
              ออกจากระบบ <MdLogout aria-hidden="true" />
            </button>
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

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </>
  );
}
