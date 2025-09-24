// src/components/chat/ChatHistory.tsx
import React, { useState, useRef, useEffect } from "react";
import { FiTrash2, FiMoreHorizontal } from "react-icons/fi";
import { type ChatSession } from "../../services/chatHistoryService";
import "./ChatHistory.css";

interface ChatHistoryProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onLoadChat: (sessionId: string) => void;
  onDeleteChat: (sessionId: string) => void;
}

// Component สำหรับ dropdown menu ภายใน
const HistoryItemMenu: React.FC<{ onDelete: () => void }> = ({ onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
    setIsOpen(false);
  };

  return (
    <div className="chat-history-menu-container" ref={menuRef}>
      <button
        className="chat-history-menu-trigger"
        onClick={handleMenuClick}
        aria-label="เมนูเพิ่มเติม"
      >
        <FiMoreHorizontal size={16} />
      </button>

      {isOpen && (
        <div className="chat-history-dropdown">
          <button
            className="chat-history-dropdown-item delete"
            onClick={handleDelete}
          >
            <FiTrash2 size={16} />
            <span>ลบข้อมูล</span>
          </button>
        </div>
      )}
    </div>
  );
};

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  sessions,
  currentSessionId,
  onLoadChat,
  onDeleteChat,
}) => {
  // จัดกลุ่ม sessions ตามวันที่
  const groupSessionsByDate = (sessions: ChatSession[]) => {
    const groups: { [key: string]: ChatSession[] } = {};
    const now = new Date();

    // สร้างวันที่ปัจจุบันแบบ reset เวลาเป็น 00:00:00
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayTime = today.getTime();

    sessions.forEach((session) => {
      const sessionDate = new Date(session.updatedAt);
      const sessionDateOnly = new Date(
        sessionDate.getFullYear(),
        sessionDate.getMonth(),
        sessionDate.getDate()
      );
      const sessionTime = sessionDateOnly.getTime();

      // คำนวณความต่างเป็นวัน
      const diffInMs = todayTime - sessionTime;
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      let groupKey: string;

      if (diffInDays === 0) {
        groupKey = "วันนี้";
      } else if (diffInDays === 1) {
        groupKey = "เมื่อวาน";
      } else if (diffInDays >= 2 && diffInDays <= 7) {
        groupKey = "สัปดาห์นี้";
      } else if (diffInDays >= 8 && diffInDays <= 30) {
        groupKey = "เดือนนี้";
      } else {
        groupKey = "เก่ากว่านี้";
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(session);
    });

    // เรียงข้อมูลในแต่ละกลุ่มตามเวลา (ใหม่สุดก่อน)
    Object.keys(groups).forEach((key) => {
      groups[key].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });

    return groups;
  };

  const groupedSessions = groupSessionsByDate(sessions);
  const groupOrder = [
    "วันนี้",
    "เมื่อวาน",
    "สัปดาห์นี้",
    "เดือนนี้",
    "เก่ากว่านี้",
  ];

  // Debug - ดูข้อมูลการจัดกลุ่ม
  console.log("Grouped sessions:", groupedSessions);
  console.log(
    "Current sessions:",
    sessions.map((s) => ({
      id: s.id,
      title: s.title,
      updatedAt: s.updatedAt,
      date: new Date(s.updatedAt).toLocaleDateString("th-TH"),
    }))
  );

  if (sessions.length === 0) {
    return (
      <div className="chat-history">
        <div className="chat-history-empty">
          <p>ยังไม่มีประวัติการสนทนา</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-history">
      <div className="chat-history-scroll">
        {groupOrder.map((groupName) => {
          const groupSessions = groupedSessions[groupName];
          if (!groupSessions || groupSessions.length === 0) return null;

          return (
            <div key={groupName} className="chat-history-group">
              <div className="chat-history-group-header">
                <h4>{groupName}</h4>
              </div>

              <div className="chat-history-group-items">
                {groupSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`chat-history-item ${
                      session.id === currentSessionId ? "active" : ""
                    }`}
                  >
                    <button
                      className="chat-history-button"
                      onClick={() => onLoadChat(session.id)}
                    >
                      <div className="chat-history-title">{session.title}</div>
                    </button>

                    <div className="chat-history-menu">
                      <HistoryItemMenu
                        onDelete={() => onDeleteChat(session.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
