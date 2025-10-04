// src/components/sections/TestimonialsSection.tsx
import React, { useState, useEffect } from "react";
import { GoArrowRight, GoArrowLeft } from "react-icons/go";
import { FiStar } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
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
      const reviews = await reviewService.getGoodReviews();

      if (reviews.length > 0) {
        const formattedReviews = reviews.map((review) => ({
          id: review.id,
          text: review.review_comment,
          author: review.reviewer_name,
          rating: review.rating,
          avatar: reviewService.getAvatarUrl(review.reviewer_name),
        }));

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
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const visibleCount = 5;

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

          {testimonials.length > visibleCount && (
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
