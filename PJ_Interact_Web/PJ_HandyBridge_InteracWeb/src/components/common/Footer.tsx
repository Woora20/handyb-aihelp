import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-brand-top">
            <img
              src="/src/assets/logo/logo_handy1.png"
              alt="Handy Bridge"
              className="footer-logo"
            />
            <span className="footer-brand-text">Handy Bridge</span>
          </div>
          <p className="footer-description">
            แพลตฟอร์มเรียนภาษามือออนไลน์ด้วย AI
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <p>เรียนรู้</p>
            <a href="#">คำภาษามือ</a>
            <a href="#">AI ตอบคำถาม</a>
            <a href="#">ฝึกผมภาษามือ</a>
          </div>

          <div className="footer-column">
            <p>เก็บกำไร</p>
            <a href="#">วิตถุประสงค์</a>
          </div>

          <div className="footer-column">
            <p>ช่วยเหลือ</p>
            <a href="#">คำถามที่พบบ่อย</a>
            <a href="#">ข่าวสาร</a>
          </div>

          <div className="footer-column">
            <p>ร่วมพัฒนา</p>
            <a href="#">สั่งทำศพที่พัฒน์</a>
            <a href="#">ร่วงเว็บไซต์</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-bottom-left">
          <p>&copy; 2025 KKU Sign Language Learning Platform</p>
        </div>

        <div className="footer-bottom-links">
          <a href="#">ข้อกำหนด</a>
          <a href="#">ความเป็นส่วนตัว</a>
        </div>

        <div className="footer-social">
          <a href="#" className="social-icon">
            𝕏
          </a>
          <a href="#" className="social-icon">
            💬
          </a>
          <a href="#" className="social-icon">
            f
          </a>
        </div>
      </div>
    </footer>
  );
}
