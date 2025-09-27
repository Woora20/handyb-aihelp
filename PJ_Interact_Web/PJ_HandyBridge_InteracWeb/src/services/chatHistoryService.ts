// src/services/chatHistoryService.ts
import { supabase } from '../lib/supabase';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export class ChatHistoryService {
  // ดึงประวัติจาก Supabase
  async getHistory(): Promise<ChatSession[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No user logged in');
        return [];
      }

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ Loaded sessions:', data?.length || 0);

      return (data || []).map(session => ({
        id: session.id,
        title: session.title,
        messages: session.messages as ChatMessage[],
        createdAt: new Date(session.created_at),
        updatedAt: new Date(session.updated_at)
      }));
    } catch (error) {
      console.error('❌ Error loading chat history:', error);
      return [];
    }
  }

  // บันทึก session ใหม่
  async saveSession(messages: ChatMessage[]): Promise<string> {
    if (messages.length === 0) return '';

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ User not authenticated');
        throw new Error('User not authenticated');
      }

      const title = this.generateTitle(messages[0]?.content || 'การสนทนาใหม่');

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title,
          messages: messages,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Session created:', data.id);
      return data.id;
    } catch (error) {
      console.error('❌ Error saving session:', error);
      return '';
    }
  }

  // อัพเดท session
  async updateSession(sessionId: string, messages: ChatMessage[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({
          messages: messages,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;
      console.log('✅ Session updated:', sessionId);
    } catch (error) {
      console.error('❌ Error updating session:', error);
    }
  }

  // ลบ session
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      console.log('✅ Session deleted:', sessionId);
    } catch (error) {
      console.error('❌ Error deleting session:', error);
    }
  }

  // ดึง session เดียว
  async getSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        messages: data.messages as ChatMessage[],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('❌ Error getting session:', error);
      return null;
    }
  }

  private generateTitle(firstMessage: string): string {
    const title = firstMessage.slice(0, 30);
    return title.length < firstMessage.length ? `${title}...` : title;
  }
}

export const chatHistoryService = new ChatHistoryService();