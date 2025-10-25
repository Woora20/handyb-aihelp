// src/pages/AIChatbot.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  FiPaperclip,
  FiImage,
  FiArrowUp,
  FiPlus,
  FiArrowDown,
  FiMenu,
  FiX,
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
  const [isMobile, setIsMobile] = useState(false);

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

  // ตรวจสอบขนาดหน้าจอ
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
      // ปิด sidebar อัตโนมัติใน mobile
      if (window.innerWidth <= 767) {
        setIsSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Scroll to bottom เมื่อมีข้อความใหม่
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Scroll to bottom เมื่อโหลดประวัติ
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [currentSessionId]);

  // ตรวจสอบการ scroll เพื่อแสดง/ซ่อนปุ่ม
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

  // ปิด sidebar อัตโนมัติเมื่อคลิกนอก sidebar ใน mobile
  useEffect(() => {
    if (!isMobile || isSidebarCollapsed) return;

    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.querySelector(".chatbot-sidebar");
      const target = e.target as Node;

      if (sidebar && !sidebar.contains(target)) {
        setIsSidebarCollapsed(true);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isSidebarCollapsed]);

  const handleNewChat = () => {
    clearChat();
    setMessage("");
    // ปิด sidebar หลังจากสร้างแชทใหม่ใน mobile
    if (isMobile) {
      setIsSidebarCollapsed(true);
    }
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

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
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

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize
    const textarea = e.target;
    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, isMobile ? 100 : 120);
    textarea.style.height = `${newHeight}px`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileUpload = (acceptType: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = acceptType;
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // TODO: Handle file upload
        console.log("File selected:", file.name);
      }
    };
    input.click();
  };

  const handleLoadChat = (sessionId: string) => {
    loadChat(sessionId);
    // ปิด sidebar หลังโหลดแชทใน mobile
    if (isMobile) {
      setIsSidebarCollapsed(true);
    }
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
                    {isMobile ? (
                      isSidebarCollapsed ? (
                        <FiMenu size={20} />
                      ) : (
                        <FiX size={20} />
                      )
                    ) : (
                      <GoTable size={20} />
                    )}
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
                    onLoadChat={handleLoadChat}
                    onDeleteChat={deleteChat}
                  />
                </>
              )}
            </div>
          </aside>

          <main className="chatbot-content">
            {/* ปุ่มเปิด Sidebar - แสดงทั้ง Desktop และ Mobile */}
            {isSidebarCollapsed && (
              <button
                className="mobile-menu-button"
                onClick={handleToggleSidebar}
                aria-label="เปิดเมนู"
              >
                <FiMenu size={22} />
              </button>
            )}

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
                          onChange={handleTextareaChange}
                          onKeyDown={handleKeyDown}
                          placeholder={
                            isMobile
                              ? "ถามฉันเกี่ยวกับภาษามือ..."
                              : "ถามฉันได้ทุกอย่างกับภาษามือเลย......"
                          }
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

                      {!isMobile && (
                        <div className="input-row-attachments">
                          <div className="attachment-buttons">
                            <button
                              type="button"
                              className="attachment-btn"
                              disabled={isLoading}
                              aria-label="แนบไฟล์"
                              onClick={() =>
                                handleFileUpload(".pdf,.doc,.docx,.txt")
                              }
                            >
                              <FiPaperclip size={24} />
                            </button>
                            <button
                              type="button"
                              className="attachment-btn"
                              disabled={isLoading}
                              aria-label="แนบรูปภาพ"
                              onClick={() => handleFileUpload("image/*")}
                            >
                              <FiImage size={24} />
                            </button>
                          </div>
                        </div>
                      )}
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
                          {!isMobile && (
                            <div className="message-time">
                              {new Date(msg.timestamp).toLocaleTimeString(
                                "th-TH",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          )}
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

                {/* ปุ่ม Scroll to Bottom */}
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
                          onChange={handleTextareaChange}
                          onKeyDown={handleKeyDown}
                          placeholder={
                            isMobile ? "พิมพ์ข้อความ..." : "พิมพ์ข้อความ..."
                          }
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

                      {!isMobile && (
                        <div className="input-row-attachments">
                          <div className="attachment-buttons">
                            <button
                              type="button"
                              className="attachment-btn"
                              disabled={isLoading}
                              aria-label="แนบไฟล์"
                              onClick={() =>
                                handleFileUpload(".pdf,.doc,.docx,.txt")
                              }
                            >
                              <FiPaperclip size={24} />
                            </button>
                            <button
                              type="button"
                              className="attachment-btn"
                              disabled={isLoading}
                              aria-label="แนบรูปภาพ"
                              onClick={() => handleFileUpload("image/*")}
                            >
                              <FiImage size={24} />
                            </button>
                          </div>
                        </div>
                      )}
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
