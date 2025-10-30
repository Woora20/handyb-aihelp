// src/components/sections/HeroSection.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      <h1>
        การเรียนรู้ภาษามือ 👋🏻,
        <br />
        เพื่อการศึกษาที่เท่าเทียมและเข้าถึงได้สำหรับทุกคน
      </h1>

      <div className="hero-buttons">
        <button className="hero-btn" onClick={() => navigate("/search")}>
          <img src="/icons/search-icon.png" className="btn-icon" alt="ค้นหา" />
          <span className="btn-text">ค้นหาภาษามือ</span>
        </button>

        <button className="hero-btn" onClick={() => navigate("/ai-assistant")}>
          <img src="/icons/chatai-icon.png" className="btn-icon" alt="AI" />
          <span className="btn-text">AI ผู้ช่วยภาษามือ</span>
        </button>
      </div>

      <div className="hero-image">
        <img src="/images/hero-image.png" alt="การเรียนรู้ภาษามือ" />
      </div>
    </section>
  );
};
