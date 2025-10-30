// src/components/sections/TestimonialsSection.tsx
import React, { useState, useEffect } from "react";
import { GoArrowRight, GoArrowLeft } from "react-icons/go";
import { FiStar } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { reviewService } from "../../services/reviewService";
import { supabase } from "../../lib/supabase";

interface Testimonial {
  id: string;
  text: string;
  author: string;
  rating: number;
  avatar: string;
}

export const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ⬇️ เพิ่ม: ตรวจสอบขนาดหน้าจอ
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    loadReviews();
    handleResize(); // ⬅️ เช็คขนาดหน้าจอตอนเริ่มต้น
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ⬇️ ฟังก์ชันปรับจำนวน card ตามขนาดหน้าจอ
  const handleResize = () => {
    const width = window.innerWidth;
    if (width < 768) {
      setVisibleCount(1); // Mobile: 1 card
    } else if (width < 1024) {
      setVisibleCount(2); // Tablet: 2 cards
    } else {
      setVisibleCount(5); // Desktop: 5 cards
    }
    setCurrentIndex(0); // รีเซ็ต index เมื่อเปลี่ยนขนาด
  };

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const reviews = await reviewService.getSmartReviews();

      if (reviews.length > 0) {
        const formattedReviews = await Promise.all(
          reviews.map(async (review) => {
            let displayName = review.reviewer_name;
            let avatarUrl = reviewService.getAvatarUrl(review.reviewer_name);

            if (review.user_id) {
              try {
                const { data: profile } = await supabase
                  .from("profiles")
                  .select("full_name, avatar_url")
                  .eq("id", review.user_id)
                  .single();

                if (profile) {
                  displayName = profile.full_name || review.reviewer_name;
                  avatarUrl = profile.avatar_url || avatarUrl;
                }
              } catch (err) {
                console.log("Could not fetch profile for review");
              }
            }

            return {
              id: review.id,
              text: review.review_comment,
              author: displayName,
              rating: review.rating,
              avatar: avatarUrl,
            };
          })
        );

        setTestimonials(formattedReviews);
      } else {
        setTestimonials([
          {
            id: "1",
            text: "เว็บไซต์นี้ช่วยให้ผมเรียนรู้ภาษามือได้ง่ายมาก!",
            author: "ผู้ใช้ทดสอบ",
            rating: 5,
            avatar:
              "https://ui-avatars.com/api/?name=ผู้ใช้ทดสอบ&background=4b648b&color=fff",
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - visibleCount));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const nextIndex = prev + visibleCount;
      if (nextIndex >= testimonials.length) {
        return prev;
      }
      return nextIndex;
    });
  };

  const endIndex = Math.min(currentIndex + visibleCount, testimonials.length);
  const itemsToShow = testimonials.slice(currentIndex, endIndex);

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex + visibleCount < testimonials.length;
  const showArrows = testimonials.length > visibleCount;

  if (isLoading) {
    return (
      <section className="testimonials-section">
        <div className="testimonials-container">
          <h1 className="testimonials-title">เรื่องราวแห่งการเข้าใจกัน</h1>
          <div style={{ textAlign: "center", padding: "50px" }}>
            <p>กำลังโหลดรีวิว...</p>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return (
      <section className="testimonials-section">
        <div className="testimonials-container">
          <h1 className="testimonials-title">เรื่องราวแห่งการเข้าใจกัน</h1>
          <div style={{ textAlign: "center", padding: "50px" }}>
            <p>ยังไม่มีรีวิว เป็นคนแรกที่รีวิว!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <h1 className="testimonials-title">เรื่องราวแห่งการเข้าใจกัน</h1>

        <div className="testimonials-content">
          <div className="testimonials-wrapper">
            <div className="testimonials-grid">
              {itemsToShow.map((testimonial) => (
                <div key={testimonial.id} className="testimonial-card">
                  <p className="testimonial-text">{testimonial.text}</p>

                  <div className="testimonial-author">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      className="author-avatar"
                    />
                    <div className="author-info">
                      <p className="author-name">{testimonial.author}</p>
                      <div className="rating">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="star-icon">
                            {i < testimonial.rating ? (
                              <FaStar size={14} color="#fbbf24" />
                            ) : (
                              <FiStar size={14} color="#e5e7eb" />
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {showArrows && (
            <div className="navigation-arrows">
              <button
                className="nav-arrow nav-prev"
                onClick={handlePrev}
                disabled={!canGoPrev}
                aria-label="Previous testimonials"
              >
                <GoArrowLeft size={16} />
              </button>

              <button
                className="nav-arrow nav-next"
                onClick={handleNext}
                disabled={!canGoNext}
                aria-label="Next testimonials"
              >
                <GoArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
