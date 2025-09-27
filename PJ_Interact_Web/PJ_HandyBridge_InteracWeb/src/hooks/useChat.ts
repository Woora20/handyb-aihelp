// src/hooks/useChat.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { openaiService, type ChatMessage } from '../services/openaiService';
import { chatHistoryService, type ChatSession } from '../services/chatHistoryService';
import { v4 } from 'uuid';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  
  // 🔥 เพิ่ม ref เพื่อป้องกันบันทึกซ้ำ
  const isSavingRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // โหลดประวัติเมื่อเริ่มต้น
  useEffect(() => {
    const loadHistory = async () => {
      console.log('📋 Loading history...');
      const history = await chatHistoryService.getHistory();
      setChatHistory(history);
    };
    loadHistory();
  }, []);

  // 🔥 บันทึกแบบ debounce (รอ 500ms ถึงบันทึก)
  useEffect(() => {
    if (messages.length === 0) return;

    // ยกเลิก timeout เดิม (ถ้ามี)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // ตั้ง timeout ใหม่
    saveTimeoutRef.current = setTimeout(async () => {
      if (isSavingRef.current) {
        console.log('⏭️ Skipping save (already saving)');
        return;
      }

      isSavingRef.current = true;
      console.log('💾 Saving session...', { currentSessionId, messageCount: messages.length });

      try {
        if (currentSessionId) {
          // อัพเดท session เดิม
          await chatHistoryService.updateSession(currentSessionId, messages);
        } else {
          // สร้าง session ใหม่
          const newSessionId = await chatHistoryService.saveSession(messages);
          setCurrentSessionId(newSessionId);
        }

        // โหลดประวัติใหม่
        const freshHistory = await chatHistoryService.getHistory();
        setChatHistory(freshHistory);
        console.log('✅ History updated:', freshHistory.length);
      } catch (err) {
        console.error('❌ Save error:', err);
      } finally {
        isSavingRef.current = false;
      }
    }, 500); // 🔥 รอ 500ms ถึงจะบันทึก

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
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

  const loadChat = useCallback(async (sessionId: string) => {
    console.log('📂 Loading chat:', sessionId);
    const session = await chatHistoryService.getSession(sessionId);
    if (session) {
      setMessages(session.messages);
      setCurrentSessionId(sessionId);
      setError(null);
    }
  }, []);

  const deleteChat = useCallback(async (sessionId: string) => {
    console.log('🗑️ Deleting chat:', sessionId);
    await chatHistoryService.deleteSession(sessionId);
    
    const freshHistory = await chatHistoryService.getHistory();
    setChatHistory(freshHistory);
    
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