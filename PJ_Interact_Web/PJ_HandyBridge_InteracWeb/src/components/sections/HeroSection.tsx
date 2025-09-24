// src/components/sections/HeroSection.tsx
import React from "react";

export const HeroSection: React.FC = () => {
  return (
    <section className="hero-section">
      <h1>
        การเรียนรู้ภาษามือ 👋🏻,
        <br />
        เพื่อการศึกษาที่เท่าเทียมและเข้าถึงได้สำหรับทุกคน
      </h1>

      <div className="hero-buttons">
        <button className="hero-btn">
          <img
            src="/src/assets/icons/search-icon.png"
            className="btn-icon"
            alt="ข้อความ"
          />
          <span className="btn-text">ค้นหาภาษามือ</span>
        </button>

        <button className="hero-btn">
          <img
            src="/src/assets/icons/chatai-icon.png"
            className="btn-icon"
            alt="ข้อความ"
          />
          <span className="btn-text">AI ผู้ช่วยภาษามือ</span>
        </button>
      </div>

      <div className="hero-image">
        <img src="/src/assets/images/hero-image.png" alt="การเรียนรู้ภาษามือ" />
      </div>
    </section>
  );
};
