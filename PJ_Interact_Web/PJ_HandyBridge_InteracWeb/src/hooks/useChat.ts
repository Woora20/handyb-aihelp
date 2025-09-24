// src/hooks/useChat.ts
import { useState, useCallback, useEffect } from 'react';
import { openaiService, type ChatMessage } from '../services/openaiService';
import { chatHistoryService, type ChatSession } from '../services/chatHistoryService';
import { v4 } from 'uuid';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);

  // โหลดประวัติเมื่อเริ่มต้น
  useEffect(() => {
    setChatHistory(chatHistoryService.getHistory());
  }, []);

  // บันทึกการสนทนาเมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    if (messages.length > 0) {
      if (currentSessionId) {
        chatHistoryService.updateSession(currentSessionId, messages);
      } else {
        const newSessionId = chatHistoryService.saveSession(messages);
        setCurrentSessionId(newSessionId);
      }
      setChatHistory(chatHistoryService.getHistory());
    }
  }, [messages, currentSessionId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: v4(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await openaiService.sendMessage(content, messages);
      
      const aiMessage: ChatMessage = {
        id: v4(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
      setError(errorMessage);
      
      const errorAiMessage: ChatMessage = {
        id: v4(),
        role: 'assistant',
        content: `❌ ${errorMessage}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorAiMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setCurrentSessionId(null);
  }, []);

  const loadChat = useCallback((sessionId: string) => {
    const session = chatHistoryService.getSession(sessionId);
    if (session) {
      setMessages(session.messages);
      setCurrentSessionId(sessionId);
      setError(null);
    }
  }, []);

  const deleteChat = useCallback((sessionId: string) => {
    chatHistoryService.deleteSession(sessionId);
    setChatHistory(chatHistoryService.getHistory());
    
    // ถ้าลบ session ที่กำลังใช้อยู่ ให้เริ่มใหม่
    if (sessionId === currentSessionId) {
      clearChat();
    }
  }, [currentSessionId, clearChat]);

  return {
    messages,
    isLoading,
    error,
    currentSessionId,
    chatHistory,
    sendMessage,
    clearChat,
    loadChat,
    deleteChat
  };
};