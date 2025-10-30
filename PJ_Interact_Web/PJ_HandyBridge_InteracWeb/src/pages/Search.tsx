// src/pages/Search.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { FiChevronDown, FiSearch } from "react-icons/fi";
import { wordService } from "../services/wordService";
import type { Word, Category } from "../types/word.types";
import "./Search.css";

export default function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchMode, setSearchMode] = useState<"text" | "hand">("text");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [signs, setSigns] = useState<Word[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // โหลดหมวดหมู่เมื่อเริ่มต้น
  useEffect(() => {
    const fetchCategories = async () => {
      const cats = await wordService.getAllCategories();
      setCategories(cats);
    };
    fetchCategories();
  }, []);

  // โหลดคำศัพท์เมื่อเริ่มต้นหรือเมื่อมีการค้นหา
  useEffect(() => {
    const fetchWords = async () => {
      setIsLoading(true);
      try {
        // ✅ แก้ไขตรงนี้: ถ้าเลือก "all" ให้ส่ง undefined, ถ้าไม่ใช่ให้ส่ง category_id
        const categoryId =
          selectedCategory !== "all" ? selectedCategory : undefined;

        if (searchQuery.trim()) {
          // ถ้ามีการค้นหา
          const results = await wordService.searchWords(
            searchQuery,
            categoryId,
            50
          );
          setSigns(results);
          setTotalCount(results.length);
        } else if (categoryId) {
          // ถ้าเลือกหมวดหมู่เฉพาะ (ไม่ใช่ "ทั้งหมด") และไม่มีการค้นหา
          const results = await wordService.searchWords("", categoryId, 50);
          setSigns(results);
          setTotalCount(results.length);
        } else {
          // ถ้าเลือก "ทั้งหมด" และไม่มีการค้นหา
          const { data, count } = await wordService.getAllWords(50, 0);
          setSigns(data);
          setTotalCount(count);
        }
      } catch (error) {
        console.error("Error fetching words:", error);
        setSigns([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWords();
  }, [searchQuery, selectedCategory]); // ✅ ต้องมี dependency ทั้ง searchQuery และ selectedCategory

  // จำนวนคำที่แสดง
  const displayedSigns = signs.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  const handleCardClick = (id: string) => {
    navigate(`/word/${id}`);
  };

  return (
    <div className="search-page">
      <Navbar />

      <main className="search-main">
        {/* Header - Desktop only */}
        <div className="search-header">
          <h1>ค้นหาคำศัพท์ภาษามือที่ต้องการเรียนรู้</h1>
        </div>

        {/* Search Section */}
        <div className="search-section">
          {/* Toggle Buttons */}
          <div className="search-toggle">
            <button
              className={`toggle-option ${
                searchMode === "text" ? "active" : ""
              }`}
              onClick={() => setSearchMode("text")}
            >
              <img
                src="/icons/text-icon.png"
                alt="ข้อความ"
                className="toggle-icon"
              />
              <span className="toggle-label">ข้อความ</span>
            </button>
            <button
              className={`toggle-option ${
                searchMode === "hand" ? "active" : ""
              }`}
              onClick={() => setSearchMode("hand")}
            >
              <img
                src="/icons/hand-icon.png"
                alt="ภาพมือ"
                className="toggle-icon"
              />
              <span className="toggle-label">ภาษามือ</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="search-bar-container">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="สวัสดี"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="category-select-wrapper">
              <select
                className="category-select"
                value={selectedCategory}
                onChange={(e) => {
                  console.log("Selected category:", e.target.value); // ✅ เพิ่ม log เพื่อ debug
                  setSelectedCategory(e.target.value);
                  setVisibleCount(10); // รีเซ็ตจำนวนที่แสดง
                }}
              >
                <option value="all">ทั้งหมด</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <FiChevronDown className="select-arrow" />
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="search-content-container">
          {/* Results Count */}
          <div className="results-info">
            <p>
              {isLoading
                ? "กำลังค้นหา..."
                : `คำศัพท์ทั้งหมด: ${totalCount.toLocaleString()} คำ`}
            </p>
          </div>

          {/* Results Grid */}
          {isLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "300px",
              }}
            >
              <div className="loading-spinner"></div>
            </div>
          ) : displayedSigns.length > 0 ? (
            <div className="search-results-grid">
              {displayedSigns.map((sign) => (
                <div
                  key={sign.id}
                  className="search-sign-card"
                  onClick={() => handleCardClick(sign.id)}
                >
                  <div className="search-card-video">
                    <div className="video-placeholder">
                      {sign.thumbnail_url && (
                        <img src={sign.thumbnail_url} alt={sign.word} />
                      )}
                    </div>
                  </div>
                  <div className="search-card-content">
                    <p className="search-card-category">
                      {sign.category?.name || "ไม่ระบุหมวดหมู่"}
                    </p>
                    <p className="search-card-word">{sign.word}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#6b7280",
              }}
            >
              <p style={{ fontSize: "18px", marginBottom: "8px" }}>
                ไม่พบคำศัพท์ที่ค้นหา
              </p>
              <p style={{ fontSize: "14px" }}>
                ลองค้นหาด้วยคำอื่นหรือเปลี่ยนหมวดหมู่
              </p>
            </div>
          )}

          {/* Load More Button */}
          {!isLoading && visibleCount < signs.length && (
            <div className="load-more-container">
              <button className="load-more-btn" onClick={handleLoadMore}>
                โหลดเพิ่มเติม
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
