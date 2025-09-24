// src/components/chat/WelcomeScreen.tsx
import React from "react";

interface SuggestionCard {
  icon: string;
  title: string;
  description: string;
}

interface WelcomeScreenProps {
  userName?: string;
  onSuggestionClick: (suggestion: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  userName = "username",
  onSuggestionClick,
}) => {
  const suggestions: SuggestionCard[] = [
    {
      icon: "👋",
      title: "ภาษามือคืออะไร?",
      description:
        "เป็นภาษาที่ใช้รูปพิมพากษฎญมทีอธอารมาะเชรณญสารดถกการเบีอคือระเซกใท้เไซจอณะ นำนใกใช้เยกองใใส?",
    },
    {
      icon: "🤟",
      title: "สอนคำทักทายให้หน่อย",
      description:
        "อยากเรียนคำทักทายพื้นฐานภาษามือ เช่น สวัสดี ขอบคุณ ขอโทษ ทำภาษามือยังไง?",
    },
    {
      icon: "☝️",
      title: "เริ่มมือใหม่บาง?",
      description: "ช่วยแนะนำพิจองรีเงิน ในเว็บไซต์ และช่วยอาการใช้งานส่วนน้อย",
    },
    {
      icon: "🤚",
      title: "แนะนำการฝึกใหม่",
      description:
        "วิธีการฝึกฝนภาษามือปรัปสำคัญราว และการควบคุมท่าทำด้วยใกลส่ำคัญศน",
    },
  ];

  return (
    <div className="welcome-screen">
      <div className="welcome-message">
        <div className="welcome-greeting">
          <span className="wave-emoji">👋</span>
          <h1>สวัสดี, {userName}</h1>
        </div>
        <p className="welcome-subtitle">วันนี้มีอะไรให้ ดันจ่วยมั่ย?</p>
      </div>

      <div className="suggestions-grid">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="suggestion-card"
            onClick={() => onSuggestionClick(suggestion.title)}
          >
            <div className="suggestion-icon">{suggestion.icon}</div>
            <div className="suggestion-content">
              <h3 className="suggestion-title">{suggestion.title}</h3>
              <p className="suggestion-description">{suggestion.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
