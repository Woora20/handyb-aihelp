// src/pages/Search.tsx
import React, { useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { FiChevronDown, FiSearch } from "react-icons/fi";
import "./Search.css";

// Mock Data
const MOCK_SIGNS = [
  { id: 1, category: "การทักทาย", word: "สวัสดี" },
  { id: 2, category: "การทักทาย", word: "สวัสดี: ท่ามือนี้ใช้กันเพื่อน" },
  {
    id: 3,
    category: "การทักทาย",
    word: "สวัสดี: ท่ามือนี้ใช้กับผู้ใหญ่ ผู้มีอาวุโส ผู้มีตำแหน่งสูง",
  },
  { id: 4, category: "การทักทาย", word: "ขอบคุณ" },
  { id: 5, category: "การทักทาย", word: "ขอโทษ" },
  { id: 6, category: "ครอบครัว", word: "พ่อ" },
  { id: 7, category: "ครอบครัว", word: "แม่" },
  { id: 8, category: "ครอบครัว", word: "พี่" },
  { id: 9, category: "ครอบครัว", word: "น้อง" },
  { id: 10, category: "อาหาร", word: "ข้าว" },
  { id: 11, category: "อาหาร", word: "น้ำ" },
  { id: 12, category: "อาหาร", word: "อร่อย" },
  { id: 13, category: "อารมณ์", word: "ดีใจ" },
  { id: 14, category: "อารมณ์", word: "เสียใจ" },
  { id: 15, category: "อารมณ์", word: "โกรธ" },
];

const CATEGORIES = ["การทักทาย", "ครอบครัว", "อาหาร", "อารมณ์", "ฉุกเฉิน"];

export default function Search() {
  const [searchMode, setSearchMode] = useState<"text" | "hand">("text");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("การทักทาย");
  const [visibleCount, setVisibleCount] = useState(10);

  // Filter signs
  const filteredSigns = MOCK_SIGNS.filter((sign) => {
    const matchesSearch = sign.word
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const displayedSigns = filteredSigns.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  return (
    <div className="search-page">
      <Navbar />

      <main className="search-main">
        {/* Header */}
        <div className="search-header">
          <h1>ค้นหาคำศัพท์ภาษามือที่ต้องการเรียนรู้</h1>
        </div>

        {/* Search Section */}
        <div className="search-section">
          {/* Toggle Text/Hand */}
          <div className="search-toggle">
            <button
              className={`toggle-option ${
                searchMode === "text" ? "active" : ""
              }`}
              onClick={() => setSearchMode("text")}
            >
              <img
                src="/src/assets/icons/text-icon.png"
                alt="ข้อความ"
                className="toggle-icon"
              />
            </button>
            <button
              className={`toggle-option ${
                searchMode === "hand" ? "active" : ""
              }`}
              onClick={() => setSearchMode("hand")}
            >
              <img
                src="/src/assets/icons/hand-icon.png"
                alt="ภาพมือ"
                className="toggle-icon"
              />
            </button>
          </div>

          {/* Search Bar with Category Dropdown */}
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
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <FiChevronDown className="select-arrow" />
            </div>
          </div>
        </div>

        {/* 🔥 Content Container - ครอบ results + grid + button */}
        <div className="search-content-container">
          {/* Results Count */}
          <div className="results-info">
            <p>คำศัพท์ทั้งหมด: {filteredSigns.length.toLocaleString()} คำ</p>
          </div>

          {/* Results Grid */}
          <div className="search-results-grid">
            {displayedSigns.map((sign) => (
              <div key={sign.id} className="search-sign-card">
                <div className="search-card-video">
                  <div className="video-placeholder">
                    {/* Placeholder สำหรับ GIF/Video จาก API */}
                  </div>
                </div>
                <div className="search-card-content">
                  <p className="search-card-category">{sign.category}</p>
                  <p className="search-card-word">{sign.word}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {visibleCount < filteredSigns.length && (
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
