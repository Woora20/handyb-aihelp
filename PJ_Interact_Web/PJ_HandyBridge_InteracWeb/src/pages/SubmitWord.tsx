// src/pages/SubmitWord.tsx - แก้ไขให้บังคับ login
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { FiUpload } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import "./SubmitWord.css";
import { submitWordService } from "../services/submitWordService";

export default function SubmitWord() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [showLoginMessage, setShowLoginMessage] = useState(false); // 🔥 เพิ่ม

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    wordText: "",
    videoUrl: "",
    description: "",
  });

  const [errors, setErrors] = useState<any>({});

  // 🔥 Auto-fill ข้อมูลเมื่อมี user login
  useEffect(() => {
    if (profile && user) {
      setFormData((prev) => ({
        ...prev,
        fullName: profile.full_name || "",
        email: user.email || profile.email || "",
      }));
    }
  }, [profile, user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev: any) => ({ ...prev, [field]: "" }));
    setShowLoginMessage(false); // 🔥 ซ่อนข้อความเมื่อมีการแก้ไข
  };

  const handleVideoSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/mp4,video/mov";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 50 * 1024 * 1024) {
          setErrors({ video: "ไฟล์วิดีโอต้องไม่เกิน 50MB" });
          return;
        }
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
        setErrors((prev: any) => ({ ...prev, video: "" }));
      }
    };
    input.click();
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "กรุณากรอกชื่อ-สกุล";
    }

    if (!formData.email.trim()) {
      newErrors.email = "กรุณากรอกอีเมล";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (!formData.wordText.trim()) {
      newErrors.wordText = "กรุณากรอกคำศัพท์";
    }

    if (!videoFile && !formData.videoUrl.trim()) {
      newErrors.video = "กรุณาอัพโหลดวิดีโอหรือใส่ลิงก์วิดีโอ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔥 ตรวจสอบ login ก่อน
    if (!user) {
      setShowLoginMessage(true);
      setErrors({});
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      let finalVideoUrl = formData.videoUrl;

      // 1. อัพโหลดวิดีโอถ้ามี
      if (videoFile) {
        console.log("Uploading video...");
        finalVideoUrl = await submitWordService.uploadVideo(videoFile);
      }

      // 2. ส่งข้อมูลเข้า Database
      await submitWordService.submitWord({
        word_text: formData.wordText,
        video_url: finalVideoUrl,
        description: formData.description,
        submitter_name: formData.fullName,
        submitter_email: formData.email,
        user_id: user?.id || undefined,
      });

      alert("ส่งคำศัพท์สำเร็จ! ขอบคุณสำหรับการมีส่วนร่วม");
      navigate("/");
    } catch (error) {
      console.error("Submit error:", error);
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาด กรุณาลองใหม่",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="submit-word-page">
      <Navbar />

      <main className="submit-word-main">
        <div className="submit-word-container">
          {/* Toggle Buttons */}
          <div className="page-toggle">
            <button className="toggle-btn active">ส่งคำศัพท์ใหม่</button>
            <button className="toggle-btn" onClick={() => navigate("/review")}>
              รีวิวเว็บไซต์
            </button>
          </div>

          {/* Header */}
          <div className="submit-header">
            <h1>ส่งคำศัพท์ภาษามือใหม่ๆ ให้เพื่อนๆ ได้เรียนรู้</h1>
            <p style={{ whiteSpace: "pre-line" }}>
              {!user
                ? "มีคำศัพท์ภาษามือที่อยากแบ่งปัน? ส่งมาให้เราเพื่อเพิ่มในระบบ (ต้องเข้าสู่ระบบก่อนส่ง)"
                : "มีคำศัพท์ภาษามือที่อยากแบ่งปัน? ส่งมาให้เราเพื่อเพิ่มในระบบ AI\nและช่วยให้คนอื่นได้เรียนรู้ร่วมกัน"}
            </p>
          </div>

          {/* Form */}
          <form className="submit-form" onSubmit={handleSubmit}>
            {/* 🔥 แสดงข้อความ login */}
            {showLoginMessage && (
              <div className="login-required-message">
                <p>
                  กรุณา{" "}
                  <button
                    type="button"
                    className="login-link"
                    onClick={() => navigate("/auth?mode=login")}
                  >
                    เข้าสู่ระบบ
                  </button>{" "}
                  ก่อนส่งคำศัพท์
                </p>
              </div>
            )}

            {errors.general && (
              <div className="error-message general">{errors.general}</div>
            )}

            <div className="form-row">
              <div className="form-field">
                <label>ชื่อ-สกุล*</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  placeholder="เช่น จอร์น สมิธ"
                  className={errors.fullName ? "error" : ""}
                  disabled={isLoading}
                  readOnly={!!user}
                  style={{
                    cursor: user ? "not-allowed" : "text",
                  }}
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
                  readOnly={!!user}
                  style={{
                    cursor: user ? "not-allowed" : "text",
                  }}
                />
                {errors.email && (
                  <span className="error-text">{errors.email}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>เพิ่มคำใหม่*</label>
                <input
                  type="text"
                  value={formData.wordText}
                  onChange={(e) =>
                    handleInputChange("wordText", e.target.value)
                  }
                  placeholder="พิมพ์คำศัพท์ที่ต้องการเพิ่ม"
                  className={errors.wordText ? "error" : ""}
                  disabled={isLoading}
                />
                {errors.wordText && (
                  <span className="error-text">{errors.wordText}</span>
                )}
              </div>

              <div className="form-field">
                <label>วิดีโอภาษามือ</label>
                <div className="video-input-group">
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) =>
                      handleInputChange("videoUrl", e.target.value)
                    }
                    placeholder="ลิงก์วิดีโอ (รองรับ MP4, MOV ขนาดไม่เกิน 50MB)"
                    className={`video-url-input ${errors.video ? "error" : ""}`}
                    disabled={isLoading || !!videoFile}
                  />
                  <button
                    type="button"
                    className="upload-btn"
                    onClick={handleVideoSelect}
                    disabled={isLoading}
                  >
                    <FiUpload />
                    เลือกไฟล์
                  </button>
                </div>
                {videoFile && (
                  <div className="file-info">
                    ไฟล์ที่เลือก: {videoFile.name}
                    <button
                      type="button"
                      className="remove-file"
                      onClick={() => {
                        setVideoFile(null);
                        setVideoPreview("");
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
                {errors.video && (
                  <span className="error-text">{errors.video}</span>
                )}
              </div>
            </div>

            <div className="form-field full-width">
              <label>
                มีอะไรที่อยากให้เราทราบเพิ่มเติมเกี่ยวกับคำศัพท์ที่ส่งมาไหม?
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="เช่น ความหมายเพิ่มเติม, บริบทการใช้งาน, ใช้กับโอกาส, ใช้เมื่อไหร่, หรือมีความหมายพิเศษอะไร"
                className="description-textarea"
                rows={2}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? "กำลังส่ง..." : "ส่งคำศัพท์ใหม่"}
            </button>
          </form>
        </div>
      </main>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
}
