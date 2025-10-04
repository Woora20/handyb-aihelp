// src/components/profile/EditProfileModal.tsx - แก้ไขส่วนที่เปลี่ยน
import React, { useState, useRef } from "react";
import { FiX, FiPlus } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import "./EditProfileModal.css";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
}: EditProfileModalProps) {
  const { profile, user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: profile?.full_name || "",
    email: user?.email || "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    profile?.avatar_url || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev: any) => ({ ...prev, [field]: "" }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 🔥 เปลี่ยนจาก 1MB เป็น 5MB
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ avatar: "ไฟล์รูปต้องไม่เกิน 5MB" });
        return;
      }

      // ตรวจสอบประเภทไฟล์
      if (!file.type.startsWith("image/")) {
        setErrors({ avatar: "กรุณาเลือกไฟล์รูปภาพ" });
        return;
      }

      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setErrors((prev: any) => ({ ...prev, avatar: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "กรุณากรอกชื่อ-สกุล";
    } else {
      const parts = formData.fullName.trim().split(" ").filter(Boolean);
      if (parts.length < 2) {
        newErrors.fullName = "กรุณากรอกชื่อและนามสกุล";
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "กรุณากรอกอีเมล";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user) return;

    setIsLoading(true);

    try {
      let avatarUrl = profile?.avatar_url;

      // 1. อัพโหลดรูปโปรไฟล์ (ถ้ามี)
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      // 2. อัพเดทข้อมูลโปรไฟล์
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName.trim(),
          email: formData.email.trim(),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // 3. อัพเดทอีเมลใน Auth (ถ้าเปลี่ยน)
      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email,
        });

        if (emailError) throw emailError;
      }

      alert("บันทึกข้อมูลเรียบร้อยแล้ว!");
      window.location.reload();
    } catch (error: any) {
      console.error("Update error:", error);
      setErrors({
        general: error.message || "เกิดข้อผิดพลาด กรุณาลองใหม่",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    formData.fullName || "User"
  )}&background=4b648b&color=fff&size=200`;

  return (
    <>
      {/* Backdrop */}
      <div className="edit-profile-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="edit-profile-modal">
        {/* Header */}
        <div className="modal-header">
          <h2>แก้ไขโปรไฟล์</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {errors.general && (
            <div className="error-message general">{errors.general}</div>
          )}

          {/* Avatar Upload */}
          <div className="avatar-section">
            <div className="avatar-upload-wrapper">
              <img
                src={avatarPreview || defaultAvatar}
                alt="Profile"
                className="avatar-preview"
              />
              <button
                type="button"
                className="avatar-add-btn"
                onClick={handleAvatarClick}
                disabled={isLoading}
              >
                <FiPlus size={20} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
            </div>
            <div className="avatar-info">
              <p className="avatar-label">อัปโหลดรูปภาพ</p>
              {/* 🔥 เปลี่ยนข้อความ */}
              <p className="avatar-hint">Max file size: 5MB</p>
              <button
                type="button"
                className="change-avatar-btn"
                onClick={handleAvatarClick}
                disabled={isLoading}
              >
                เปลี่ยนรูปภาพ
              </button>
            </div>
          </div>

          {errors.avatar && <span className="error-text">{errors.avatar}</span>}

          {/* Form Fields */}
          <div className="form-fields">
            <div className="form-field">
              <label>ชื่อ-สกุล*</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="นาย สมบัติ"
                className={errors.fullName ? "error" : ""}
                disabled={isLoading}
              />
              {errors.fullName && (
                <span className="error-text">{errors.fullName}</span>
              )}
            </div>

            <div className="form-field">
              <label>อีเมล*</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="เช่น john@email.com"
                className={errors.email ? "error" : ""}
                disabled={isLoading}
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose} disabled={isLoading}>
            ยกเลิก
          </button>
          <button
            className="save-btn"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </>
  );
}
