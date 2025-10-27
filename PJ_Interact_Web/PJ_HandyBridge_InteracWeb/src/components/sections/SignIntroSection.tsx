// src/components/sections/SignIntroSection.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SignCard } from "../common/SignCard";
import { wordService } from "../../services/wordService";
import type { Word } from "../../types/word.types";

const CATEGORIES = [
  "ทั้งหมด",
  "การทักทาย",
  "ครอบครัว",
  "อาหาร",
  "อารมณ์",
  "ฉุกเฉิน",
];

export const SignIntroSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWords = async () => {
      setIsLoading(true);
      try {
        if (activeCategory === "ทั้งหมด") {
          // ดึงคำศัพท์ยอดนิยม
          const featured = await wordService.getFeaturedWords(4);
          setWords(featured);
        } else {
          // ดึงคำศัพท์ตามหมวดหมู่
          const categoryWords = await wordService.getWordsByCategory(
            activeCategory,
            4
          );
          setWords(categoryWords);
        }
      } catch (error) {
        console.error("Error fetching words:", error);
        setWords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWords();
  }, [activeCategory]);

  const handleViewMore = () => {
    navigate("/search");
  };

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

      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "60px 0",
            minHeight: "400px",
          }}
        >
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          <div className="sign-cards-grid">
            {words.length > 0 ? (
              words.map((item) => (
                <SignCard
                  key={item.id}
                  id={item.id}
                  category={item.category?.name || "ไม่ระบุ"}
                  word={item.word}
                  thumbnailUrl={item.thumbnail_url}
                />
              ))
            ) : (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "40px",
                  color: "#6b7280",
                }}
              >
                <p>ไม่มีคำศัพท์ในหมวดหมู่นี้</p>
              </div>
            )}
          </div>

          <button className="view-more-btn" onClick={handleViewMore}>
            ค้นหาคำศัพท์เพิ่มเติม
          </button>
        </>
      )}
    </section>
  );
};
