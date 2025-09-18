// src/components/sections/SignIntroSection.tsx
import React, { useState } from "react";
import { SignCard } from "../common/SignCard";

const CATEGORIES = [
  "ทั้งหมด",
  "คำทักทาย",
  "ครอบครัว",
  "อาหาร",
  "อารมณ์",
  "ฉุกเฉิน",
];

// Mock data - ในอนาคตจะมาจาก API
const SIGN_WORDS = [
  { id: 1, category: "การทักทาย", word: "สวัสดี" },
  { id: 2, category: "การทักทาย", word: "สวัสดี: ท่ามือนี้ใช้กันเพื่อน" },
  {
    id: 3,
    category: "การทักทาย",
    word: "สวัสดี: ท่ามือนี้ใช้กับผู้ใหญ่ ผู้มีอาวุโส ผู้มีตำแหน่งสูง",
  },
  { id: 4, category: "การทักทาย", word: "สวัสดี: ท่ามือนี้ใช้กันเพื่อน" },
];

export const SignIntroSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");

  return (
    <section className="sign-intro-section">
      <h1>เริ่มต้นเรียนภาษามือจากหลายหมวดที่คุณสนใจ</h1>

      <div className="sign-list-intro">
        <nav className="category-nav">
          <ul className="category-list">
            {CATEGORIES.map((category) => (
              <li
                key={category}
                className={`category-item ${
                  activeCategory === category ? "active" : ""
                }`}
              >
                <button
                  className="category-btn"
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="sign-cards-grid">
        {SIGN_WORDS.map((item) => (
          <SignCard key={item.id} category={item.category} word={item.word} />
        ))}
      </div>

      <button className="view-more-btn">ค้นหาคำศัพท์เพิ่มเติม</button>
    </section>
  );
};
