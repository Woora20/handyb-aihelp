// src/components/sections/TestimonialsSection.tsx
import React, { useState } from "react";
import { GoArrowRight, GoArrowLeft } from "react-icons/go";

interface Testimonial {
  id: number;
  text: string;
  author: string;
  rating: number;
  avatar: string;
}

export const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      text: "ไม่เคยคิดว่าจะเรียนภาษามือได้! AI ตอบคำถามได้ทุกอย่างและวิดีโอชัดมาก ทำงานได้ง่ายเลยตอนนี้พูดกับลูกสาวได้แล้ว",
      author: "สมศรี เจริญสุข",
      rating: 5,
      avatar: "https://i.pravatar.cc/56?img=1",
    },
    {
      id: 2,
      text: "ลูกชายเป็นหูหนวกทั้งครอบครัวเรียนผ่านเว็บนี้ใช้งานง่าย เข้าใจเร็วตอนนี้สื่อสารกันได้ดีขึ้นมาก",
      author: "นายณัฐ วงค์ประเสริฐ",
      rating: 5,
      avatar: "https://i.pravatar.cc/56?img=2",
    },
    {
      id: 3,
      text: "ใช้สอนนักเรียนในโรงเรียน ระบบ AI ช่วยได้มาก นักเรียนชอบมากเพราะเรียนได้ตามจังหวะตัวเอง",
      author: "อาจารย์ปิยะดา ศรีสุข",
      rating: 5,
      avatar: "https://i.pravatar.cc/56?img=3",
    },
    {
      id: 4,
      text: "ทำงานอาสาที่โรงพยาบาลต้องสื่อสารกับผู้ป่วยหูหนวกเรียนจากเว็บนี้ 2 สัปดาห์ใช้งานได้จริงมาก!",
      author: "คุณอนุ รักชาติ",
      rating: 5,
      avatar: "https://i.pravatar.cc/56?img=4",
    },
    {
      id: 5,
      text: "อายุ 65 แล้ว คิดว่าจะเรียนยากแต่เว็บนี้ทำให้เรียนง่ายมาก ตอนนี้พูดกับหลานที่หูหนวกได้",
      author: "คุณยาย มาลี ดีมาก",
      rating: 5,
      avatar: "https://i.pravatar.cc/56?img=5",
    },
  ];

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
        </div>
      </div>
    </section>
  );
};
