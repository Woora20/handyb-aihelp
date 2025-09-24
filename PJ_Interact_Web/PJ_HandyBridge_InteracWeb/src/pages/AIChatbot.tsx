import React from "react";
import Navbar from "../components/common/Navbar";
import "./AIChatbot.css";

export default function AIChatbot() {
  return (
    <div className="ai-chatbot-page">
      <Navbar />

      <div className="chatbot-main-content">
        <div className="chatbot-inner-container">
          {/* Sidebar ซ้ายมือ */}
          <aside className="chatbot-sidebar">
            {/* Sidebar content จะใส่ทีหลัง */}
          </aside>

          {/* Main Chat Area */}
          <main className="chatbot-content">
            {/* Chat content จะใส่ทีหลัง */}
          </main>
        </div>
      </div>
    </div>
  );
}
