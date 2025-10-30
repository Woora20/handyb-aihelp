// src/components/sections/SignIntroSection.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SignCard } from "../common/SignCard";
import { wordService } from "../../services/wordService";
import type { Word, Category } from "../../types/word.types";

export const SignIntroSection: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // หมวดหมู่ที่ต้องการแสดง
  const DISPLAY_CATEGORIES = [
    "การทักทาย",
    "ครอบครัว",
    "อาหาร",
    "อารมณ์",
    "สถานที่",
  ];

  // ดึงหมวดหมู่จาก Supabase และกรองเฉพาะที่ต้องการ
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const allCategories = await wordService.getAllCategories();
        // กรองเฉพาะหมวดหมู่ที่ต้องการแสดง
        const filteredCategories = allCategories.filter((cat) =>
          DISPLAY_CATEGORIES.includes(cat.name)
        );
        setCategories(filteredCategories);
        // ตั้งค่า activeCategory เริ่มต้นเป็น null (ทั้งหมด)
        setActiveCategory(null);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // ดึงคำศัพท์ตาม category ที่เลือก
  useEffect(() => {
    const fetchWords = async () => {
      setIsLoading(true);
      try {
        if (activeCategory === null) {
          // แสดงคำศัพท์ยอดนิยม
          const featured = await wordService.getFeaturedWords(4);
          setWords(featured);
        } else {
          // แสดงคำศัพท์ตามหมวดหมู่ (ส่ง category_id)
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

    if (categories.length > 0 || activeCategory === null) {
      fetchWords();
    }
  }, [activeCategory, categories]);

  const handleViewMore = () => {
    navigate("/search");
  };

  return (
    <section className="sign-intro-section">
      <h1>เริ่มต้นเรียนภาษามือจากหลายหมวดที่คุณสนใจ</h1>

      <div className="sign-list-intro">
        <nav className="category-nav">
          <ul className="category-list">
            {/* ปุ่ม "ทั้งหมด" */}
            <li
              className={`category-item ${
                activeCategory === null ? "active" : ""
              }`}
            >
              <button
                className="category-btn"
                onClick={() => setActiveCategory(null)}
              >
                ทั้งหมด
              </button>
            </li>

            {/* ปุ่มหมวดหมู่จาก Supabase */}
            {categories.map((category) => (
              <li
                key={category.id}
                className={`category-item ${
                  activeCategory === category.id ? "active" : ""
                }`}
              >
                <button
                  className="category-btn"
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name}
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
