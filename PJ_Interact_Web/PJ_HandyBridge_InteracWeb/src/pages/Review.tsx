// src/pages/Review.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { FiStar } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import "./Review.css";

export default function Review() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    newFeature: "",
    rating: 0,
    favoriteFeature: "",
    understandingLevel: "",
    feedback: "",
  });

  const [errors, setErrors] = useState<any>({});

  // Dropdown options
  const favoriteFeatures = [
    "ค้นหาภาษามือ",
    "AI Chatbot",
    "ฝึกฝนภาษามือ",
    "ส่งคำศัพท์ใหม่",
    "ดีไซน์เว็บไซต์",
    "ความเร็วในการใช้งาน",
  ];

  const understandingLevels = [
    "ไม่เข้าใจเลย",
    "เข้าใจนิดหน่อย",
    "เข้าใจพอใช้",
    "เข้าใจดี",
    "เข้าใจดีมาก",
  ];

  // Auto-fill user data
  useEffect(() => {
    if (profile && user) {
      setFormData((prev) => ({
        ...prev,
        fullName: profile.full_name || "",
        email: user.email || profile.email || "",
      }));
    }
  }, [profile, user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev: any) => ({ ...prev, [field]: "" }));
  };

  const handleRatingClick = (rating: number) => {
    handleInputChange("rating", rating);
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

    if (formData.rating === 0) {
      newErrors.rating = "กรุณาให้คะแนน";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { error } = await supabase.from("website_reviews").insert([
        {
          reviewer_name: formData.fullName,
          reviewer_email: formData.email,
          rating: formData.rating,
          new_feature_request: formData.newFeature,
          favorite_feature: formData.favoriteFeature,
          understanding_level: formData.understandingLevel,
          feedback: formData.feedback,
          user_id: user?.id || null,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      alert("ขอบคุณสำหรับความคิดเห็น! 🙏");
      navigate("/");
    } catch (error) {
      console.error("Submit error:", error);
      setErrors({
        general: "เกิดข้อผิดพลาด กรุณาลองใหม่",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="review-page">
      <Navbar />

      <main className="review-main">
        <div className="review-container">
          {/* Toggle Buttons */}
          <div className="page-toggle">
            <button
              className="toggle-btn"
              onClick={() => navigate("/submit-word")}
            >
              ส่งคำศัพท์ใหม่
            </button>
            <button className="toggle-btn active">รีวิวเว็บไซต์</button>
          </div>

          {/* Header */}
          <div className="review-header">
            <h1>แบ่งปันความคิดเห็น ช่วยพัฒนาเว็บไซต์ให้ดีขึ้น</h1>
            <p>
              ความคิดเห็นของคุณมีค่ามากสำหรับเรา ไม่ว่าจะเป็นข้อเสนอแนะ
              ปัญหาที่พบ
              <br />
              หรือฟีเจอร์ที่อยากให้เพิ่ม
              เพื่อให้ได้เว็บไซต์ที่ใช้งานง่ายและเป็นมิตรมากขึ้น
            </p>
          </div>

          {/* Form */}
          <form className="review-form" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="error-message general">{errors.general}</div>
            )}

            {/* Row 1: ชื่อ-สกุล และ อีเมล */}
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

            {/* Row 2: ฟีเจอร์ที่อยากให้เพิ่ม และ คะแนนความพึงพอใจ */}
            <div className="form-row">
              <div className="form-field">
                <label>ฟีเจอร์ที่อยากให้เพิ่ม</label>
                <input
                  type="text"
                  value={formData.newFeature}
                  onChange={(e) =>
                    handleInputChange("newFeature", e.target.value)
                  }
                  placeholder="เช่น แบบทดสอบและหมวดหมู่"
                  disabled={isLoading}
                />
              </div>

              <div className="form-field">
                <label>คะแนนความพึงพอใจโดยรวม (1-5 ดาว)*</label>
                <div className="rating-input-container">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${
                        star <= (hoveredRating || formData.rating)
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handleRatingClick(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      disabled={isLoading}
                    >
                      <FiStar />
                    </button>
                  ))}
                  <span className="rating-label">
                    {formData.rating > 0
                      ? `${formData.rating}/5`
                      : "/เยี่ยมมาก"}
                  </span>
                </div>
                {errors.rating && (
                  <span className="error-text">{errors.rating}</span>
                )}
              </div>
            </div>

            {/* Row 3: Dropdowns */}
            <div className="form-row">
              <div className="form-field">
                <label>ส่วนไหนที่ชอบที่สุด</label>
                <select
                  value={formData.favoriteFeature}
                  onChange={(e) =>
                    handleInputChange("favoriteFeature", e.target.value)
                  }
                  className="form-select"
                  disabled={isLoading}
                >
                  <option value="">เช่น AI Chatbot</option>
                  {favoriteFeatures.map((feature) => (
                    <option key={feature} value={feature}>
                      {feature}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>ระดับความเข้าใจภาษามือหลังจากใช้เว็บ</label>
                <select
                  value={formData.understandingLevel}
                  onChange={(e) =>
                    handleInputChange("understandingLevel", e.target.value)
                  }
                  className="form-select"
                  disabled={isLoading}
                >
                  <option value="">รู้จักภาษามือมากขึ้นมั้ย</option>
                  {understandingLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Full Width: Feedback */}
            <div className="form-field full-width">
              <label>ปัญหาที่พบ หรือข้อเสนอแนะ</label>
              <textarea
                value={formData.feedback}
                onChange={(e) => handleInputChange("feedback", e.target.value)}
                placeholder="เช่น ข้อความเล็กเกินไป, อยากให้มีคำศัพท์เกี่ยวกับการทำงาน, AI ตอบไม่ตรงคำถาม"
                className="feedback-textarea"
                rows={4}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? "กำลังส่ง..." : "ส่งความคิดเห็น"}
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
