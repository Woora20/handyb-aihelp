import React, { useState, useRef } from "react";
import { FiPlus, FiX, FiPaperclip, FiImage, FiArrowUp } from "react-icons/fi";
import Navbar from "../components/common/Navbar";
import { useAuth } from "../contexts/AuthContext";
import "./AIChatbot.css";

interface SuggestionCard {
  icon: string;
  title: string;
  description: string;
}

export default function AIChatbot() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mock suggestions data
  const suggestions: SuggestionCard[] = [
    {
      icon: "👋",
      title: "ภาษามือคืออะไร?",
      description:
        "ฉันอยากเรียนรู้พื้นฐานภาษามือ ช่วยอธิบายให้ฟังหน่อยได้ไหม? เริ่มต้นยังไงดี?",
    },
    {
      icon: "🤟",
      title: "สอนคำทักทายให้หน่อย",
      description:
        "อยากเรียนคำพื้นฐานที่ใช้ทุกวัน เช่น สวัสดี ขอบคุณ ขอโทษ ทำท่าทางยังไง?",
    },
    {
      icon: "☝️",
      title: "เว็บนี้มีอะไรบ้าง?",
      description:
        "ช่วยแนะนำฟีเจอร์ต่างๆ ในเว็บไซต์ และบอกวิธีใช้งานให้เข้าใจง่ายหน่อย",
    },
    {
      icon: "🤚",
      title: "แนะนำการฝึกฝน",
      description:
        "วิธีฝึกภาษามืออย่างมีประสิทธิภาพ เทคนิคการจำท่ามือ และแบบฝึกหัดที่เหมาะกับผู้เริ่มต้น",
    },
  ];

  const handleNewChat = () => {
    setMessages([]);
    setMessage("");
    console.log("เริ่มแชทใหม่");
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSuggestionClick = (suggestion: SuggestionCard) => {
    setMessage(suggestion.description);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleSendMessage = (messageText: string) => {
    const textToSend = messageText || message.trim();
    if (textToSend && textToSend.length > 0) {
      console.log("ส่งข้อความ:", textToSend);
      setMessages((prev) => [...prev, { type: "user", content: textToSend }]);
      setMessage("");
    }
  };

  const handleAttachFile = () => {
    console.log("แนบไฟล์");
  };

  const handleAttachImage = () => {
    console.log("แนบรูปภาพ");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const userName = profile?.full_name?.split(" ")[0] || "username";

  return (
    <div className="ai-chatbot-page">
      <Navbar />

      <div className="chatbot-main-content">
        <div className="chatbot-inner-container">
          {/* ✅ Sidebar - กลับไปใช้ structure เดิม */}
          <aside
            className={`chatbot-sidebar ${
              isSidebarCollapsed ? "collapsed" : ""
            }`}
          >
            <div className="chatbot-sidebar-content">
              {/* Header Section */}
              <div className="sidebar-header">
                <div className="sidebar-brand">
                  <img
                    src="/src/assets/logo/logo_handy1.png"
                    alt="AI Chatbot"
                    className="sidebar-icon"
                  />
                  <span className="sidebar-title">AI Chatbot</span>
                </div>

                <button
                  className="sidebar-close-btn"
                  onClick={handleToggleSidebar}
                  aria-label={
                    isSidebarCollapsed ? "เปิด sidebar" : "ปิด sidebar"
                  }
                >
                  {isSidebarCollapsed ? (
                    <FiPlus size={20} />
                  ) : (
                    <FiX size={20} />
                  )}
                </button>
              </div>

              {/* ✅ Content ส่วนที่เหลือ - อยู่ใน chatbot-sidebar-content */}
              {!isSidebarCollapsed && (
                <>
                  {/* Divider */}
                  <div className="sidebar-divider"></div>

                  {/* New Chat Button */}
                  <button className="new-chat-btn" onClick={handleNewChat}>
                    <FiPlus className="new-chat-icon" />
                    <span>เพิ่มแชทใหม่</span>
                  </button>
                </>
              )}
            </div>
          </aside>

          {/* Main Chat Area */}
          <main className="chatbot-content">
            {messages.length === 0 ? (
              <div className="welcome-screen">
                {/* Content 1: Welcome Message */}
                <div className="welcome-message">
                  <div className="welcome-greeting">
                    <span className="wave-emoji">👋</span>
                    <h1>สวัสดี, {userName}</h1>
                  </div>
                  <p className="welcome-subtitle">
                    วันนี้มีอะไรให้ฉันช่วยมั้ย?
                  </p>
                </div>

                {/* Content 2: Suggestions Grid */}
                <div className="suggestions-grid">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="suggestion-card"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="suggestion-content">
                        <h3 className="suggestion-title">{suggestion.title}</h3>
                        <p className="suggestion-description">
                          {suggestion.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Content 3: Chat Input ใน Welcome Screen */}
                <div className="chat-input-inline">
                  <form className="chat-input-form" onSubmit={handleSubmit}>
                    <div className="input-wrapper">
                      {/* บรรทัดแรก: Input + Send Button */}
                      <div className="input-row-main">
                        <textarea
                          ref={textareaRef}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="ถามฉันได้ทุกอย่างกับภาษามือเลย......"
                          className="chat-textarea"
                          rows={1}
                        />

                        <button
                          type="submit"
                          className={`send-btn ${
                            message.trim() ? "active" : ""
                          }`}
                          disabled={!message.trim()}
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
                            onClick={handleAttachFile}
                            aria-label="แนบไฟล์"
                          >
                            <FiPaperclip size={24} />
                          </button>
                          <button
                            type="button"
                            className="attachment-btn"
                            onClick={handleAttachImage}
                            aria-label="แนบรูปภาพ"
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
              <>
                <div className="chat-messages">
                  {/* Chat Messages จะมาใส่ที่นี่ */}
                  <div>Chat Interface จะมาใส่ที่นี่</div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
