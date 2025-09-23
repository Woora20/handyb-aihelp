// src/components/common/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

// Footer menu structure matching Navbar
const footerLinks = {
  เรียนรู้: [
    { title: "ค้นหาภาษามือ", path: "/search" },
    { title: "AI ตอบคำถาม", path: "/ai-assistant" },
    { title: "ฝึกฝนภาษามือ", path: "/practice" },
  ],
  เกี่ยวกับเรา: [{ title: "วัตถุประสงค์", path: "/purpose" }],
  ช่วยเหลือ: [
    { title: "คำถามที่พบบ่อย", path: "/faq" },
    { title: "ข่าวสาร", path: "/news" },
  ],
  ร่วมพัฒนา: [
    { title: "ส่งคำศัพท์ใหม่", path: "/submit-word" },
    { title: "รีวิวเว็บไซต์", path: "/review" },
  ],
};

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Brand Section */}
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

        {/* Links Section */}
        <div className="footer-links">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="footer-column">
              <p>{category}</p>
              {links.map((link, index) => (
                <Link key={index} to={link.path}>
                  {link.title}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="footer-bottom">
        <div className="footer-bottom-left">
          <p>&copy; 2025 KKU Sign Language Learning Platform</p>
        </div>

        <div className="footer-bottom-links">
          <Link to="/terms">ข้อกำหนด</Link>
          <Link to="/privacy">ความเป็นส่วนตัว</Link>
        </div>

        <div className="footer-social">
          <a href="#" className="social-icon" aria-label="X">
            𝕏
          </a>
          <a href="#" className="social-icon" aria-label="Line">
            💬
          </a>
          <a href="#" className="social-icon" aria-label="Facebook">
            f
          </a>
        </div>
      </div>
    </footer>
  );
}
