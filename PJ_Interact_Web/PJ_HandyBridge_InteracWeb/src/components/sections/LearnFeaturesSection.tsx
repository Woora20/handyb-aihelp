// src/components/sections/LearnFeaturesSection.tsx
import React from "react";
// Import รูปภาพ icons
import aiAssistantIcon from "../../assets/images/features/ai-assistant.png";
import graduationCapIcon from "../../assets/images/features/graduation-cap.png";
import devicesIcon from "../../assets/images/features/devices.png";
// Import รูปภาพหลัก
import womanLearningImg from "../../assets/images/woman-learning.jpg";

export const LearnFeaturesSection: React.FC = () => {
  const features = [
    {
      icon: aiAssistantIcon,
      title: "AI ผู้ช่วยอัจฉริยะ",
      line1: "ระบบอัจฉริยะที่ช่วยแนะนำ",
      line2: "การเรียนรู้ภาษามือได้ตลอด",
      line3: "24 ชั่วโมง",
    },
    {
      icon: graduationCapIcon,
      title: "เหมาะกับทุกคน",
      line1: "เริ่มต้นง่าย ไม่ยาก",
      line2: "เรียนตามจังหวะตัวเอง",
      line3: "",
    },
    {
      icon: devicesIcon,
      title: "รองรับทุกอุปกรณ์",
      line1: "มือถือ แท็บเล็ต คอม",
      line2: "ใช้งานได้ทุกที่",
      line3: "",
    },
  ];

  return (
    <section className="why-learn-section">
      <div className="why-learn-container">
        {/* Header Part */}
        <div className="why-learn-header">
          <h1 className="why-learn-title">
            เรียนภาษามือ
            <br />
            ได้ง่ายขึ้นกว่าที่เคย
          </h1>

          <p className="why-learn-description">
            สร้างสะพานเชื่อมระหว่างผู้ที่ใช้ภาษามือและ
            <br />
            ผู้ที่ต้องการเรียนรู้ ด้วยเทคโนโลยีที่ทำให้ การสื่อสารเป็นสิ่งสวยงาม
          </p>
        </div>

        {/* Content Part */}
        <div className="why-learn-content">
          {/* Features List with vertical line */}
          <div className="features-wrapper">
            <div className="features-list">
              {features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <div className="icon-line-wrapper">
                    <div className="feature-icon-wrapper">
                      <img
                        src={feature.icon}
                        alt={feature.title}
                        className="feature-icon-img"
                      />
                    </div>
                    {index < features.length - 1 && (
                      <div className="vertical-line"></div>
                    )}
                  </div>
                  <div className="feature-text">
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">
                      {feature.line1}
                      {feature.line2 && <br />}
                      {feature.line2}
                      {feature.line3 && <br />}
                      {feature.line3}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image Placeholder */}
          <div className="learn-image-container">
            <div className="learn-image-placeholder">
              <img
                src={womanLearningImg}
                alt="Woman learning sign language online"
                className="learn-image"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
