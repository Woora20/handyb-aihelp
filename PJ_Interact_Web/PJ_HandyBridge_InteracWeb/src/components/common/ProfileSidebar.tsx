// src/components/common/ProfileSidebar.tsx - แก้ไข
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { IoLogOutOutline } from "react-icons/io5";
import EditProfileModal from "../profile/EditProfileModal"; // 🔥 เพิ่ม
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
  const [showEditModal, setShowEditModal] = useState(false); // 🔥 เพิ่ม

  const handleSignOut = async () => {
    await signOut();
    onClose();
    navigate("/");
  };

  const handleEditClick = () => {
    setShowEditModal(true); // 🔥 เปิด Modal
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
            <button className="avatar-edit" onClick={handleEditClick}>
              {" "}
              {/* 🔥 เปลี่ยน */}
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

        <div className="sidebar-content">
          <h2 className="sidebar-title">โปรไฟล์</h2>
          <p className="info-text">ชื่อ-สกุล: {profile.full_name}</p>
          <p className="info-text">อีเมล: {profile.email}</p>
          <button className="sidebar-signout" onClick={handleSignOut}>
            ออกจากระบบ <IoLogOutOutline size={24} />
          </button>
        </div>
      </div>

      {/* 🔥 Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </>
  );
}
