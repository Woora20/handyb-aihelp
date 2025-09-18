// src/components/common/SignCard.tsx
import React from "react";

interface SignCardProps {
  category: string;
  word: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export const SignCard: React.FC<SignCardProps> = ({
  category,
  word,
  videoUrl,
  thumbnailUrl,
}) => {
  return (
    <div className="sign-card">
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
