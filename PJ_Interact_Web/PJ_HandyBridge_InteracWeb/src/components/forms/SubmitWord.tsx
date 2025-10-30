// src/pages/SubmitWord.tsx - รวมวิดีโอและ GIF ในช่องเดียว
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../common/Navbar";
import Footer from "../common/Footer";
import { FiUpload } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import "./SubmitWord.css";
import { submitWordService } from "../../services/submitWordService";

export default function SubmitWord() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    wordText: "",
    videoUrl: "",
    description: "",
  });

  const [errors, setErrors] = useState<any>({});

  // Auto-fill ข้อมูลเมื่อมี user login
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
    setShowLoginMessage(false);
  };

  const handleVideoSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/mp4,video/webm,video/quicktime,image/gif";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const validTypes = [
          "video/mp4",
          "video/webm",
          "video/quicktime",
          "image/gif",
        ];
        if (!validTypes.includes(file.type)) {
          setErrors({ video: "รองรับเฉพาะไฟล์ MP4, WebM, MOV หรือ GIF" });
          return;
        }

        if (file.size > 50 * 1024 * 1024) {
          setErrors({ video: "ไฟล์ต้องไม่เกิน 50MB" });
          return;
        }

        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
        setErrors((prev: any) => ({ ...prev, video: "" }));
        setFormData((prev) => ({ ...prev, videoUrl: "" }));
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setShowLoginMessage(true);
      setErrors({});
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    setUploadProgress(0);

    try {
      setUploadProgress(10);

      const submitData = {
        word_text: formData.wordText,
        video_url: formData.videoUrl.trim() || undefined,
        video_file: videoFile || undefined,
        description: formData.description.trim() || undefined,
        submitter_name: formData.fullName,
        submitter_email: formData.email,
        user_id: user?.id,
      };

      console.log("Submitting with data:", submitData);

      setUploadProgress(30);

      await submitWordService.submitWord(submitData);

      setUploadProgress(100);

      alert("ส่งคำศัพท์สำเร็จ! ขอบคุณสำหรับการมีส่วนร่วม");

      setFormData({
        fullName: profile?.full_name || "",
        email: user?.email || profile?.email || "",
        wordText: "",
        videoUrl: "",
        description: "",
      });
      setVideoFile(null);
      setVideoPreview("");

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
      setUploadProgress(0);
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
                <label>วิดีโอ/GIF ภาษามือ (ไม่บังคับ)</label>
                <div className="video-input-group">
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) =>
                      handleInputChange("videoUrl", e.target.value)
                    }
                    placeholder="ลิงก์วิดีโอ (MP4, MOV, WebM) หรือ GIF"
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
                <small
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  รองรับ: อัพโหลดไฟล์ (MP4, WebM, MOV, GIF ไม่เกิน 50MB)
                  หรือใส่ลิงก์จาก Giphy, Tenor
                </small>
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

            {isLoading && uploadProgress > 0 && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="progress-text">
                  กำลังส่งข้อมูล... {uploadProgress}%
                </p>
              </div>
            )}

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

      <Footer />

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
}
