// src/components/common/ProfileSidebar.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./ProfileSidebar.css";

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export default function ProfileSidebar({
  isOpen,
  onClose,
  profile,
}: ProfileSidebarProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [showEditButton, setShowEditButton] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    onClose();
    navigate("/");
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    profile.full_name
  )}&background=4b648b&color=fff&size=280`;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`sidebar-backdrop ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className={`sidebar-panel ${isOpen ? "open" : ""}`}>
        {/* Close Button */}
        <button className="sidebar-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Profile Avatar */}
        <div
          className="sidebar-avatar"
          onMouseEnter={() => setShowEditButton(true)}
          onMouseLeave={() => setShowEditButton(false)}
        >
          <img
            src={profile.avatar_url || defaultAvatar}
            alt={profile.full_name}
          />
          {showEditButton && (
            <button className="avatar-edit">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
              </svg>
              แก้ไข
            </button>
          )}
        </div>

        {/* Profile Title */}
        <h2 className="sidebar-title">โปรไฟล์</h2>

        {/* Profile Info */}
        <div className="sidebar-info">
          <div className="info-row">
            <span className="info-label">ชื่อ-สกุล:</span>
            <span className="info-value">{profile.full_name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">อีเมล:</span>
            <span className="info-value">{profile.email}</span>
          </div>
        </div>

        {/* Sign Out Button */}
        <button className="sidebar-signout" onClick={handleSignOut}>
          ออกจากระบบ
        </button>
      </div>
    </>
  );
}
