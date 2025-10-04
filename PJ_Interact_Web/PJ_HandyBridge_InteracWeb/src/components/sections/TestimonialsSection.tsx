// src/components/sections/TestimonialsSection.tsx
import React, { useState, useEffect } from "react";
import { GoArrowRight, GoArrowLeft } from "react-icons/go";
import { reviewService } from "../../services/reviewService";

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

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      // ดึงรีวิวจาก database
      const reviews = await reviewService.getGoodReviews();

      if (reviews.length > 0) {
        // แปลงข้อมูลให้ตรงกับ format ที่ใช้
        const formattedReviews = reviews.map((review) => ({
          id: review.id,
          text: review.review_comment,
          author: review.reviewer_name,
          rating: review.rating,
          avatar: reviewService.getAvatarUrl(review.reviewer_name),
        }));

        setTestimonials(formattedReviews);
      } else {
        // ถ้าไม่มีรีวิว ใช้ข้อมูล default
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
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const visibleCount = 5;

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0
        ? Math.max(0, testimonials.length - visibleCount)
        : Math.max(0, prev - 1)
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev >= testimonials.length - visibleCount ? 0 : prev + 1
    );
  };

  // ถ้ากำลังโหลด
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

  // ถ้าไม่มีรีวิว
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
              {testimonials
                .slice(currentIndex, currentIndex + visibleCount)
                .map((testimonial) => (
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
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <span key={i} className="star">
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {testimonials.length > visibleCount && (
            <div className="navigation-arrows">
              <button
                className="nav-arrow nav-prev"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                aria-label="Previous testimonials"
              >
                <GoArrowLeft size={16} />
              </button>

              <button
                className="nav-arrow nav-next"
                onClick={handleNext}
                disabled={currentIndex >= testimonials.length - visibleCount}
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
