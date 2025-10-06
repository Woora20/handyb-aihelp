// src/pages/Review.tsx - ส่วนที่แก้ไข
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { FiStar } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import "./Review.css";

export default function Review() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [existingReviewId, setExistingReviewId] = useState<string | null>(null);
  const [showLoginMessage, setShowLoginMessage] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    newFeature: "",
    rating: 0,
    favoriteFeature: "",
    understandingLevel: "",
    review_comment: "",
  });

  const [errors, setErrors] = useState<any>({});

  // ... (favoriteFeatures และ understandingLevels arrays เหมือนเดิม)
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

  const getRatingText = (rating: number) => {
    const texts = {
      1: "ต้องปรับปรุง",
      2: "พอใช้",
      3: "ดี",
      4: "ดีมาก",
      5: "เยี่ยมมาก",
    };
    return texts[rating as keyof typeof texts] || "";
  };

  const checkExistingReview = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("website_reviews")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data && !error) {
        console.log("พบรีวิวเดิม:", data);
        setExistingReviewId(data.id);

        // ใช้ข้อมูลจาก profile ล่าสุดแทน
        setFormData({
          fullName: profile?.full_name || data.reviewer_name || "",
          email: user.email || profile?.email || data.reviewer_email || "",
          newFeature: data.new_feature_request || "",
          rating: data.rating || 0,
          favoriteFeature: data.favorite_feature || "",
          understandingLevel: data.understanding_level || "",
          review_comment: data.review_comment || "",
        });
      }
    } catch (error) {
      console.log("ยังไม่มีรีวิว");
    }
  };

  // อัพเดทชื่อและอีเมลเมื่อ profile เปลี่ยน
  useEffect(() => {
    if (profile && user) {
      setFormData((prev) => ({
        ...prev,
        fullName: profile.full_name || prev.fullName || "",
        email: user.email || profile.email || prev.email || "",
      }));

      checkExistingReview();
    }
  }, [profile, user]); // รีรันเมื่อ profile หรือ user เปลี่ยน

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev: any) => ({ ...prev, [field]: "" }));
    setShowLoginMessage(false);
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

    if (!formData.review_comment.trim()) {
      newErrors.review_comment = "กรุณากรอกคอมเม้นต์";
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

    try {
      const reviewData = {
        reviewer_name: formData.fullName,
        reviewer_email: formData.email,
        rating: formData.rating,
        new_feature_request: formData.newFeature || null,
        favorite_feature: formData.favoriteFeature || null,
        understanding_level: formData.understandingLevel || null,
        review_comment: formData.review_comment,
        user_id: user?.id || null,
      };

      if (existingReviewId) {
        // อัพเดทรีวิวเดิม - อัพเดทชื่อและอีเมลด้วย
        const { data: updatedData, error } = await supabase
          .from("website_reviews")
          .update({
            ...reviewData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingReviewId)
          .eq("user_id", user?.id)
          .select()
          .single();

        if (error) throw error;

        alert("อัพเดทความคิดเห็นเรียบร้อยแล้ว! 🙏");
      } else {
        // สร้างรีวิวใหม่
        const { data: insertedData, error } = await supabase
          .from("website_reviews")
          .insert([
            {
              ...reviewData,
              created_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (error) throw error;

        alert("ขอบคุณสำหรับความคิดเห็น! 🙏");
      }

      navigate("/");
    } catch (error: any) {
      console.error("Submit error:", error);
      setErrors({
        general: `เกิดข้อผิดพลาด: ${error.message || "กรุณาลองใหม่"}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ... (ส่วน return JSX เหมือนเดิม)
  return (
    <div className="review-page">
      <Navbar />

      <main className="review-main">
        <div className="review-container">
          <div className="page-toggle">
            <button
              className="toggle-btn"
              onClick={() => navigate("/submit-word")}
            >
              ส่งคำศัพท์ใหม่
            </button>
            <button className="toggle-btn active">รีวิวเว็บไซต์</button>
          </div>

          <div className="review-header">
            <h1>
              {!user
                ? "แบ่งปันความคิดเห็น ช่วยพัฒนาเว็บไซต์ให้ดีขึ้น"
                : existingReviewId
                ? "อัพเดทความคิดเห็นของคุณ"
                : "แบ่งปันความคิดเห็น ช่วยพัฒนาเว็บไซต์ให้ดีขึ้น"}
            </h1>
            <p style={{ whiteSpace: "pre-line" }}>
              {!user
                ? "แบ่งปันความคิดเห็นของคุณ เพื่อช่วยพัฒนาเว็บไซต์ให้ดีขึ้น (กรุณาเข้าสู่ระบบก่อนส่ง)"
                : existingReviewId
                ? "คุณเคยรีวิวไปแล้ว สามารถแก้ไขหรืออัพเดทความคิดเห็นใหม่ได้"
                : "ความคิดเห็นของคุณมีค่ามากสำหรับเรา ไม่ว่าจะเป็นข้อเสนอแนะ ปัญหาที่พบ\nหรือฟีเจอร์ที่อยากให้เพิ่ม เพื่อให้ได้เว็บไซต์ที่ใช้งานง่ายและเป็นมิตรมากขึ้น"}
            </p>
          </div>

          <form className="review-form" onSubmit={handleSubmit}>
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
                  ก่อนส่งรีวิว
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

            {/* ส่วนที่เหลือของ form เหมือนเดิม */}
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
                  <div className="stars-wrapper">
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
                        {star <= (hoveredRating || formData.rating) ? (
                          <FaStar />
                        ) : (
                          <FiStar />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="rating-label">
                    {(hoveredRating || formData.rating) > 0 ? (
                      <span className="rating-value">
                        {hoveredRating || formData.rating}/
                        {getRatingText(hoveredRating || formData.rating)}
                      </span>
                    ) : (
                      <span className="rating-placeholder">/เยี่ยมมาก</span>
                    )}
                  </div>
                </div>
                {errors.rating && (
                  <span className="error-text">{errors.rating}</span>
                )}
              </div>
            </div>

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

            <div className="form-field full-width">
              <label>คอมเม้นต์และข้อเสนอแนะ*</label>
              <textarea
                value={formData.review_comment}
                onChange={(e) =>
                  handleInputChange("review_comment", e.target.value)
                }
                placeholder="บอกเล่าประสบการณ์การใช้งาน สิ่งที่ชอบ สิ่งที่อยากให้ปรับปรุง หรือคำแนะนำใดๆ ที่อยากบอกทีมพัฒนา..."
                className={`feedback-textarea ${
                  errors.review_comment ? "error" : ""
                }`}
                rows={2}
                disabled={isLoading}
              />
              {errors.review_comment && (
                <span className="error-text">{errors.review_comment}</span>
              )}
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading
                ? "กำลังบันทึก..."
                : existingReviewId
                ? "อัพเดทความคิดเห็น"
                : "ส่งความคิดเห็น"}
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
