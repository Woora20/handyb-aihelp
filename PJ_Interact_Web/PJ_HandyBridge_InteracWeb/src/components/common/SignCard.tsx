// src/components/common/SignCard.tsx - แก้ไข
import React from "react";
import { useNavigate } from "react-router-dom";

interface SignCardProps {
  id?: string; // 🔥 เพิ่ม id
  category: string;
  word: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export const SignCard: React.FC<SignCardProps> = ({
  id = "1", // default id
  category,
  word,
  videoUrl,
  thumbnailUrl,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/word/${id}`);
  };

  return (
    <div
      className="sign-card"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <div className="sign-card-video">
        <div className="video-placeholder">
          {thumbnailUrl && <img src={thumbnailUrl} alt={word} />}
        </div>
      </div>
      <div className="sign-card-content">
        <p className="sign-category">{category}</p>
        <p className="sign-word">{word}</p>
      </div>
    </div>
  );
};
