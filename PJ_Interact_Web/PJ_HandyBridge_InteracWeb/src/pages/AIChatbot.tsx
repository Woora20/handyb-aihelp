// src/pages/AIChatbot.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  FiPaperclip,
  FiImage,
  FiArrowUp,
  FiPlus,
  FiArrowDown,
} from "react-icons/fi";
import { GoTable } from "react-icons/go";
import Navbar from "../components/common/Navbar";
import { ChatHistory } from "../components/chat/ChatHistory";
import { useAuth } from "../contexts/AuthContext";
import { useChat } from "../hooks/useChat";
import "./AIChatbot.css";

import signLanguage1 from "../assets/images/hand-img/sign-language-1.png";
import signLanguage2 from "../assets/images/hand-img/sign-language-2.png";
import signLanguage3 from "../assets/images/hand-img/sign-language-3.png";
import signLanguage4 from "../assets/images/hand-img/sign-language-4.png";

interface SuggestionCard {
  icon: string;
  title: string;
  description: string;
  image?: string;
}

export default function AIChatbot() {
  const { profile } = useAuth();
  const {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    currentSessionId,
    chatHistory,
    loadChat,
    deleteChat,
  } = useChat();

  const [message, setMessage] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  const suggestions: SuggestionCard[] = [
    {
      icon: "👋",
      title: "ภาษามือคืออะไร?",
      description:
        "ฉันอยากเรียนรู้พื้นฐานภาษามือ ช่วยอธิบายให้ฟังหน่อยได้ไหม? เริ่มต้นยังไงดี?",
      image: signLanguage1,
    },
    {
      icon: "🤟",
      title: "สอนคำทักทายให้หน่อย",
      description:
        "อยากเรียนคำพื้นฐานที่ใช้ทุกวัน เช่น สวัสดี ขอบคุณ ขอโทษ ทำท่าทางยังไง?",
      image: signLanguage2,
    },
    {
      icon: "☝️",
      title: "เว็บนี้มีอะไรบ้าง?",
      description:
        "ช่วยแนะนำฟีเจอร์ต่างๆ ในเว็บไซต์ และบอกวิธีใช้งานให้เข้าใจง่ายหน่อย",
      image: signLanguage3,
    },
    {
      icon: "🤚",
      title: "แนะนำการฝึกฝน",
      description:
        "วิธีฝึกภาษามืออย่างมีประสิทธิภาพ เทคนิคการจำท่ามือ และแบบฝึกหัดที่เหมาะกับผู้เริ่มต้น",
      image: signLanguage4,
    },
  ];

  // 🔥 Scroll to bottom เมื่อมีข้อความใหม่
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // 🔥 Scroll to bottom เมื่อโหลดประวัติ
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [currentSessionId]);

  // 🔥 ตรวจสอบการ scroll เพื่อแสดง/ซ่อนปุ่ม
  useEffect(() => {
    const chatContainer = chatMessagesRef.current;
    if (!chatContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 0);
    };

    chatContainer.addEventListener("scroll", handleScroll);
    return () => chatContainer.removeEventListener("scroll", handleScroll);
  }, [messages.length]);

  const handleNewChat = () => {
    clearChat();
    setMessage("");
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSuggestionClick = (suggestion: SuggestionCard) => {
    sendMessage(suggestion.description);
  };

  const handleSendMessage = (messageText?: string) => {
    const textToSend = messageText || message.trim();
    if (textToSend && textToSend.length > 0 && !isLoading) {
      sendMessage(textToSend);
      setMessage("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 🔥 ฟังก์ชัน scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const userName = profile?.full_name?.split(" ")[0] || "username";

  return (
    <div className="ai-chatbot-page">
      <Navbar />

      <div className="chatbot-main-content">
        <div className="chatbot-inner-container">
          <aside
            className={`chatbot-sidebar ${
              isSidebarCollapsed ? "collapsed" : ""
            }`}
          >
            <div className="chatbot-sidebar-content">
              <div className="sidebar-header">
                <div className="sidebar-brand">
                  <img
                    src="/src/assets/logo/logo_handy1.png"
                    alt="AI Chatbot"
                    className="sidebar-icon"
                  />
                  <span className="sidebar-title">AI Chatbot</span>
                  <button
                    className="sidebar-close-btn"
                    onClick={handleToggleSidebar}
                    aria-label={
                      isSidebarCollapsed ? "เปิด sidebar" : "ปิด sidebar"
                    }
                  >
                    <GoTable size={20} />
                  </button>
                </div>
              </div>

              {!isSidebarCollapsed && (
                <>
                  <div className="sidebar-divider"></div>

                  <button className="new-chat-btn" onClick={handleNewChat}>
                    <FiPlus className="new-chat-icon" />
                    <span>เริ่มแชทใหม่</span>
                  </button>

                  <ChatHistory
                    sessions={chatHistory}
                    currentSessionId={currentSessionId}
                    onLoadChat={loadChat}
                    onDeleteChat={deleteChat}
                  />
                </>
              )}
            </div>
          </aside>

          <main className="chatbot-content">
            {messages.length === 0 ? (
              <div className="welcome-screen">
                <div className="welcome-message">
                  <div className="welcome-greeting">
                    <span className="wave-emoji">👋</span>
                    <h1>สวัสดี, {userName}</h1>
                  </div>
                  <p className="welcome-subtitle">
                    วันนี้มีอะไรให้ฉันช่วยมั้ย?
                  </p>
                </div>

                <div className="suggestions-grid">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="suggestion-card"
                      onClick={() => handleSuggestionClick(suggestion)}
                      disabled={isLoading}
                    >
                      <div className="suggestion-content">
                        <h3 className="suggestion-title">{suggestion.title}</h3>
                        <p className="suggestion-description">
                          {suggestion.description}
                        </p>
                      </div>
                      {suggestion.image && (
                        <div className="suggestion-image">
                          <img
                            src={suggestion.image}
                            alt={suggestion.title}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="chat-input-inline">
                  <form className="chat-input-form" onSubmit={handleSubmit}>
                    <div className="input-wrapper">
                      <div className="input-row-main">
                        <textarea
                          ref={textareaRef}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="ถามฉันได้ทุกอย่างกับภาษามือเลย......"
                          className="chat-textarea"
                          disabled={isLoading}
                          rows={1}
                        />

                        <button
                          type="submit"
                          className={`send-btn ${
                            message.trim() ? "active" : ""
                          }`}
                          disabled={!message.trim() || isLoading}
                          aria-label="ส่งข้อความ"
                        >
                          <FiArrowUp size={16} />
                        </button>
                      </div>

                      <div className="input-row-attachments">
                        <div className="attachment-buttons">
                          <button
                            type="button"
                            className="attachment-btn"
                            disabled={isLoading}
                            aria-label="แนบไฟล์"
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = ".pdf,.doc,.docx,.txt";
                              input.click();
                            }}
                          >
                            <FiPaperclip size={24} />
                          </button>
                          <button
                            type="button"
                            className="attachment-btn"
                            disabled={isLoading}
                            aria-label="แนบรูปภาพ"
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = "image/*";
                              input.click();
                            }}
                          >
                            <FiImage size={24} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="chat-interface">
                <div className="chat-messages" ref={chatMessagesRef}>
                  {messages.map((msg, index) => {
                    const prevMsg = messages[index - 1];
                    const isNewConversation =
                      !prevMsg || prevMsg.role !== msg.role;

                    return (
                      <div
                        key={msg.id}
                        className={`chat-message ${msg.role} ${
                          isNewConversation ? "new-conversation" : ""
                        }`}
                      >
                        <div className="message-bubble">
                          <div className="message-content">{msg.content}</div>
                          <div className="message-time">
                            {new Date(msg.timestamp).toLocaleTimeString(
                              "th-TH",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

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

                {/* 🔥 ปุ่ม Scroll to Bottom */}
                <button
                  className={`scroll-to-bottom ${
                    showScrollButton ? "visible" : ""
                  }`}
                  onClick={scrollToBottom}
                  aria-label="เลื่อนลงด้านล่าง"
                >
                  <FiArrowDown size={20} />
                </button>

                <div className="chat-input-fixed">
                  <form className="chat-input-form" onSubmit={handleSubmit}>
                    <div className="input-wrapper-fixed">
                      <div className="input-row-main">
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="พิมพ์ข้อความ..."
                          className="chat-textarea"
                          disabled={isLoading}
                          rows={1}
                        />

                        <button
                          type="submit"
                          className={`send-btn ${
                            message.trim() ? "active" : ""
                          }`}
                          disabled={!message.trim() || isLoading}
                          aria-label="ส่งข้อความ"
                        >
                          <FiArrowUp size={16} />
                        </button>
                      </div>

                      <div className="input-row-attachments">
                        <div className="attachment-buttons">
                          <button
                            type="button"
                            className="attachment-btn"
                            disabled={isLoading}
                            aria-label="แนบไฟล์"
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = ".pdf,.doc,.docx,.txt";
                              input.click();
                            }}
                          >
                            <FiPaperclip size={24} />
                          </button>
                          <button
                            type="button"
                            className="attachment-btn"
                            disabled={isLoading}
                            aria-label="แนบรูปภาพ"
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = "image/*";
                              input.click();
                            }}
                          >
                            <FiImage size={24} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
