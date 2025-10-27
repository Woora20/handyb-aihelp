// src/components/common/SignCard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

interface SignCardProps {
  id: string;
  category: string;
  word: string;
  thumbnailUrl?: string;
}

export const SignCard: React.FC<SignCardProps> = ({
  id,
  category,
  word,
  thumbnailUrl,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/word/${id}`);
  };

  return (
    <div className="sign-card" onClick={handleClick}>
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
