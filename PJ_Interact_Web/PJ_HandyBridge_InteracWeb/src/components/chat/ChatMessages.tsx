// src/components/chat/ChatMessages.tsx - แก้ไขใหม่
import React, { useEffect, useRef } from "react";
import { type ChatMessage } from "../../services/geminiService";
import "./ChatMessages.css";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isLoading,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="chat-messages-container">
      {messages.map((message, index) => {
        // ตรวจสอบว่าข้อความก่อนหน้าเป็น role เดียวกันมั้ย เพื่อกำหนด gap
        const prevMessage = messages[index - 1];
        const isNewConversation =
          !prevMessage || prevMessage.role !== message.role;

        return (
          <div
            key={message.id}
            className={`chat-message ${message.role} ${
              isNewConversation ? "new-conversation" : ""
            }`}
          >
            <div className="message-bubble">
              <div className="message-content">{message.content}</div>
              <div className="message-time">
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        );
      })}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="chat-message assistant">
          <div className="message-bubble loading">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
