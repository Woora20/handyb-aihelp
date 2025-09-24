// src/components/chat/ChatInput.tsx
import React, { useState } from "react";
import { FiPaperclip, FiImage, FiArrowUp } from "react-icons/fi";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onAttachFile?: () => void;
  onAttachImage?: () => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onAttachFile,
  onAttachImage,
  disabled = false,
}) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-input-container">
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          {/* บรรทัดแรก: Textarea + Send Button */}
          <div className="input-row-main">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ถามฉันได้ทุกอย่างกับภาษามือเลย......"
              className="chat-textarea"
              disabled={disabled}
              rows={1}
            />

            <button
              type="submit"
              className={`send-btn ${message.trim() ? "active" : ""}`}
              disabled={!message.trim() || disabled}
              aria-label="ส่งข้อความ"
            >
              <FiArrowUp size={16} />
            </button>
          </div>

          {/* บรรทัดที่สอง: Attachment Buttons */}
          <div className="input-row-attachments">
            <div className="attachment-buttons">
              <button
                type="button"
                className="attachment-btn"
                onClick={onAttachFile}
                disabled={disabled}
                aria-label="แนบไฟล์"
              >
                <FiPaperclip size={24} />
              </button>
              <button
                type="button"
                className="attachment-btn"
                onClick={onAttachImage}
                disabled={disabled}
                aria-label="แนบรูปภาพ"
              >
                <FiImage size={24} />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
