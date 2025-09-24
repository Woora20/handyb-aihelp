// src/services/chatHistoryService.ts
export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class ChatHistoryService {
  private storageKey = 'chatbot-history';

  // ดึงประวัติทั้งหมด
  getHistory(): ChatSession[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      
      const sessions: ChatSession[] = JSON.parse(stored);
      return sessions.map(session => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  }

  // บันทึก session ใหม่
  saveSession(messages: ChatMessage[]): string {
    if (messages.length === 0) return '';

    const sessions = this.getHistory();
    const sessionId = this.generateId();
    const title = this.generateTitle(messages[0]?.content || 'การสนทนาใหม่');
    
    const newSession: ChatSession = {
      id: sessionId,
      title,
      messages: [...messages],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    sessions.unshift(newSession); // เพิ่มที่ด้านบน
    this.saveToStorage(sessions.slice(0, 20)); // เก็บแค่ 20 session ล่าสุด
    
    return sessionId;
  }

  // อัพเดท session ที่มีอยู่
  updateSession(sessionId: string, messages: ChatMessage[]): void {
    const sessions = this.getHistory();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex !== -1) {
      sessions[sessionIndex] = {
        ...sessions[sessionIndex],
        messages: [...messages],
        updatedAt: new Date()
      };
      this.saveToStorage(sessions);
    }
  }

  // ลบ session
  deleteSession(sessionId: string): void {
    const sessions = this.getHistory();
    const filteredSessions = sessions.filter(s => s.id !== sessionId);
    this.saveToStorage(filteredSessions);
  }

  // ดึง session เดียว
  getSession(sessionId: string): ChatSession | null {
    const sessions = this.getHistory();
    return sessions.find(s => s.id === sessionId) || null;
  }

  // ล้างประวัติทั้งหมด
  clearHistory(): void {
    localStorage.removeItem(this.storageKey);
  }

  private saveToStorage(sessions: ChatSession[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  private generateId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTitle(firstMessage: string): string {
    // ตัดข้อความให้เหลือ 30 ตัวอักษร
    const title = firstMessage.slice(0, 30);
    return title.length < firstMessage.length ? `${title}...` : title;
  }
}

export const chatHistoryService = new ChatHistoryService();