// src/services/wordService.ts
import { supabase } from '../lib/supabase';
import type { Word, RelatedWord, Category } from '../types/word.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const wordService = {
  /**
   * ดึงคำศัพท์ทั้งหมด พร้อม pagination - ใช้ API
   */
  async getAllWords(limit = 10, offset = 0) {
    console.log('🔥 API_BASE_URL:', API_BASE_URL);
    console.log('🔥 Full URL:', `${API_BASE_URL}/phrases?limit=${limit}&offset=${offset}`);

    try {
      console.log('📡 About to fetch...');
      const response = await fetch(
        `${API_BASE_URL}/phrases?limit=${limit}&offset=${offset}`
      );
      console.log('✅ Response received:', response.status);
      const result = await response.json();
      console.log('📦 Result:', result);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return { 
        data: result.data || [], 
        count: result.total || 0 
      };
    } catch (error) {
      console.error('❌ Error fetching all words:', error);
      return { data: [], count: 0 };
    }
  },

  /**
   * ดึงคำศัพท์ตาม ID - ใช้ API
   */
  async getWordById(id: string): Promise<Word | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/phrases/${id}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data as Word;
    } catch (error) {
      console.error('Error fetching word by ID:', error);
      return null;
    }
  },

  /**
   * เพิ่ม view count - ใช้ API
   */
  async incrementView(wordId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/phrases/${wordId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error('Error incrementing view:', error);
      return false;
    }
  },

  /**
   * ดึงคำศัพท์ที่เกี่ยวข้อง - ใช้ API
   */
  async getRelatedWords(wordId: string): Promise<RelatedWord[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/phrases/${wordId}/related`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data || [];
    } catch (error) {
      console.error('Error fetching related words:', error);
      return [];
    }
  },

  /**
   * ค้นหาคำศัพท์ - ใช้ Supabase โดยตรง (กรองด้วย category_id)
   */
  async searchWords(query: string, categoryId?: string, limit = 20) {
    try {
      let queryBuilder = supabase
        .from('words')
        .select(`
          *,
          category:categories(id, name, name_en)
        `);

      // ค้นหาจากคำ
      if (query && query.trim()) {
        queryBuilder = queryBuilder.ilike('word', `%${query.trim()}%`);
      }

      // กรองตามหมวดหมู่ (ใช้ ID)
      if (categoryId && categoryId.trim()) {
        console.log('🔍 Filtering by category_id:', categoryId);
        queryBuilder = queryBuilder.eq('category_id', categoryId);
      }

      const { data, error } = await queryBuilder
        .order('views', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      console.log('📦 Search result count:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error searching words:', error);
      return [];
    }
  },

  /**
   * ดึงคำศัพท์ยอดนิยม (featured) - ใช้ API
   */
  async getFeaturedWords(limit = 4) {
    try {
      const response = await fetch(`${API_BASE_URL}/phrases/featured?limit=${limit}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data || [];
    } catch (error) {
      console.error('Error fetching featured words:', error);
      return [];
    }
  },

  /**
   * ดึงหมวดหมู่ทั้งหมด - ใช้ Supabase โดยตรง
   */
  async getAllCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      console.log('📦 Categories fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  /**
   * ดึงคำศัพท์ตามหมวดหมู่ - ใช้ Supabase โดยตรง (กรองด้วย category_id)
   */
  async getWordsByCategory(categoryId: string, limit = 10) {
    try {
      console.log('🔍 Fetching words for category_id:', categoryId);
      
      const { data, error } = await supabase
        .from('words')
        .select(`
          *,
          category:categories(id, name, name_en)
        `)
        .eq('category_id', categoryId)
        .order('views', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      console.log('📦 Words found:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error fetching words by category:', error);
      return [];
    }
  }
};