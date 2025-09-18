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
            src="/src/assets/icons/text-icon.png"
            className="btn-icon"
            alt="ข้อความ"
          />
          <span className="btn-text">ค้นด้วยภาษาไทย</span>
        </button>

        <button className="hero-btn">
          <img
            src="/src/assets/icons/hand-icon.png"
            className="btn-icon"
            alt="ข้อความ"
          />
          <span className="btn-text">ค้นด้วยภาษามือไทย</span>
        </button>
      </div>

      <div className="hero-image">
        <img src="/src/assets/images/hero-image.png" alt="การเรียนรู้ภาษามือ" />
      </div>
    </section>
  );
};
