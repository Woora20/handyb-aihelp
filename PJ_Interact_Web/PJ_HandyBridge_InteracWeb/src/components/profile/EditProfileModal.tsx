// src/components/profile/EditProfileModal.tsx
import React, { useState, useRef, useEffect } from "react";
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
    fullName: "",
    email: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // ควบคุม body overflow เมื่อ modal เปิด
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

  // Update form data when profile or modal opens
  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        fullName: profile.full_name || "",
        email: user?.email || "",
      });
      setAvatarPreview(profile.avatar_url || "");
      setAvatarFile(null);
      setErrors({});
    }
  }, [isOpen, profile, user]);

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
      // ตรวจสอบขนาด (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ avatar: "ไฟล์รูปต้องไม่เกิน 5MB" });
        return;
      }

      // ตรวจสอบประเภทไฟล์
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setErrors({ avatar: "รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF, WebP)" });
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

  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return null;

    try {
      // สร้างชื่อไฟล์ unique
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // ลบรูปเก่า (ถ้ามี)
      if (profile?.avatar_url) {
        try {
          // ดึง path จาก URL เก่า
          const urlParts = profile.avatar_url.split("/");
          const oldPath = urlParts.slice(-2).join("/");
          await supabase.storage.from("avatars").remove([oldPath]);
          console.log("✅ ลบรูปเดิมเรียบร้อย");
        } catch (err) {
          console.warn("⚠️ ไม่สามารถลบรูปเดิม:", err);
        }
      }

      // อัปโหลดรูปใหม่
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        console.error("❌ ข้อผิดพลาดการอัปโหลด:", error);
        throw new Error("อัปโหลดรูปภาพไม่สำเร็จ");
      }

      // ดึง public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      console.log("✅ URL รูปใหม่:", publicUrl);
      return publicUrl;
    } catch (error) {
      console.error("❌ ข้อผิดพลาดการอัปโหลด:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user) return;

    setIsLoading(true);

    try {
      let avatarUrl = profile?.avatar_url;

      // อัปโหลดรูปภาพถ้ามี
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar(user.id);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      // อัปเดทข้อมูลในฐานข้อมูล
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName.trim(),
          email: formData.email.trim(),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("❌ ข้อผิดพลาดการอัปเดทโปรไฟล์:", updateError);
        throw updateError;
      }

      // อัปเดทอีเมลใน Auth (ถ้าเปลี่ยน)
      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email,
        });

        if (emailError) {
          console.error("❌ ข้อผิดพลาดการเปลี่ยนอีเมล:", emailError);
          alert("อัปเดทข้อมูลสำเร็จ แต่ไม่สามารถเปลี่ยนอีเมลได้");
        }
      }

      alert("บันทึกข้อมูลเรียบร้อยแล้ว!");
      onClose();
    } catch (error: any) {
      console.error("❌ ข้อผิดพลาด:", error);
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
      <div
        className="edit-profile-backdrop"
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="edit-profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="modal-header">
          <h2 id="modal-title">แก้ไขโปรไฟล์</h2>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close Modal"
            type="button"
          >
            <FiX size={24} aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {errors.general && (
            <div className="error-message general" role="alert">
              {errors.general}
            </div>
          )}

          {/* Avatar Upload Section */}
          <div className="avatar-section">
            <div className="avatar-upload-wrapper">
              <img
                src={avatarPreview || defaultAvatar}
                alt="Profile Avatar"
                className="avatar-preview"
                loading="lazy"
              />
              <button
                type="button"
                className="avatar-add-btn"
                onClick={handleAvatarClick}
                disabled={isLoading}
                aria-label="Change Avatar"
              >
                <FiPlus size={20} aria-hidden="true" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
                aria-hidden="true"
              />
            </div>
            <div className="avatar-info">
              <p className="avatar-label">อัปโหลดรูปภาพ</p>
              <p className="avatar-hint">
                รองรับ JPG, PNG, GIF, WebP ขนาดไม่เกิน 5MB
              </p>
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

          {errors.avatar && (
            <span className="error-text" role="alert">
              {errors.avatar}
            </span>
          )}

          {/* Form Fields */}
          <div className="form-fields">
            <div className="form-field">
              <label htmlFor="fullName">ชื่อ-สกุล*</label>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="ตัวอย่าง: สมชาย ใจดี"
                className={errors.fullName ? "error" : ""}
                disabled={isLoading}
                aria-invalid={!!errors.fullName}
                aria-describedby={
                  errors.fullName ? "fullName-error" : undefined
                }
                autoComplete="name"
              />
              {errors.fullName && (
                <span className="error-text" id="fullName-error" role="alert">
                  {errors.fullName}
                </span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="email">อีเมล*</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="เช่น john@email.com"
                className={errors.email ? "error" : ""}
                disabled={isLoading}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                autoComplete="email"
              />
              {errors.email && (
                <span className="error-text" id="email-error" role="alert">
                  {errors.email}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="modal-footer">
          <button
            className="cancel-btn"
            onClick={onClose}
            disabled={isLoading}
            type="button"
          >
            ยกเลิก
          </button>
          <button
            className="save-btn"
            onClick={handleSubmit}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay" aria-hidden="true">
          <div className="loading-spinner" role="status" aria-label="Loading">
            <span style={{ display: "none" }}>กำลังโหลด</span>
          </div>
        </div>
      )}
    </>
  );
}
