// src/components/common/ProfileSidebar.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { IoLogOutOutline } from "react-icons/io5";
import EditProfileModal from "../profile/EditProfileModal";
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
  const [showEditModal, setShowEditModal] = useState(false);

  // ควบคุม body overflow เมื่อ sidebar เปิด
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleEditClick = () => {
    setShowEditModal(true);
    setShowEditButton(false);
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
        aria-hidden={!isOpen}
      />

      {/* Sidebar Panel */}
      <div
        className={`sidebar-panel ${isOpen ? "open" : ""}`}
        role="complementary"
        aria-label="Profile Sidebar"
        aria-hidden={!isOpen}
      >
        {/* Close Button */}
        <button
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close Sidebar"
          type="button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Avatar Section */}
        <div
          className="sidebar-avatar"
          onMouseEnter={() => setShowEditButton(true)}
          onMouseLeave={() => setShowEditButton(false)}
          role="img"
          aria-label={`Profile picture of ${profile.full_name}`}
        >
          <img
            src={profile.avatar_url || defaultAvatar}
            alt={profile.full_name}
            loading="lazy"
          />
          {showEditButton && (
            <button
              className="avatar-edit"
              onClick={handleEditClick}
              aria-label="Edit Profile Picture"
              type="button"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
              </svg>
              แก้ไข
            </button>
          )}
        </div>

        {/* Content Section */}
        <div className="sidebar-content">
          <h2 className="sidebar-title">โปรไฟล์</h2>
          <div className="sidebar-info">
            <p className="info-text">
              <strong>ชื่อ-สกุล:</strong> {profile.full_name}
            </p>
            <p className="info-text">
              <strong>อีเมล:</strong> {profile.email}
            </p>
          </div>

          {/* Sign Out Button */}
          <button
            className="sidebar-signout"
            onClick={handleSignOut}
            aria-label="Sign Out"
            type="button"
          >
            ออกจากระบบ <IoLogOutOutline size={24} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </>
  );
}
