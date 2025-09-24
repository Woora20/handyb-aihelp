// src/hooks/useChat.ts
import { useState, useCallback } from 'react';
import { geminiService, type ChatMessage } from '../services/geminiService';
import { v4 } from 'uuid';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // 🔥 ใช้ callback เพื่อเข้าถึง messages ล่าสุด
      const currentMessages = await new Promise<ChatMessage[]>((resolve) => {
        setMessages(prev => {
          resolve(prev);
          return prev;
        });
      });

      const response = await geminiService.sendMessage(content, currentMessages);
      
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
  }, []); // 👈 ไม่มี dependencies!

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat
  };
};