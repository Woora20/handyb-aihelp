// src/services/wordService.ts
import { supabase } from '../lib/supabase';
import type { Word, RelatedWord, Category } from '../types/word.types';

export const wordService = {
  /**
   * ดึงคำศัพท์ทั้งหมด พร้อม pagination
   */
  async getAllWords(limit = 10, offset = 0) {
    try {
      const { data, error, count } = await supabase
        .from('words')
        .select(`
          *,
          category:categories(id, name, name_en)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Error fetching all words:', error);
      return { data: [], count: 0 };
    }
  },

  /**
   * ดึงคำศัพท์ตาม ID (ไม่เพิ่ม views ที่นี่)
   */
  async getWordById(id: string): Promise<Word | null> {
    try {
      const { data, error } = await supabase
        .from('words')
        .select(`
          *,
          category:categories(id, name, name_en)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Word;
    } catch (error) {
      console.error('Error fetching word by ID:', error);
      return null;
    }
  },

  /**
   * เพิ่ม view count (เรียกจาก viewTracker หลังครบ 10 วินาที)
   */
  async incrementView(wordId: string): Promise<boolean> {
    try {
      // ดึงข้อมูลปัจจุบัน
      const { data: currentWord, error: fetchError } = await supabase
        .from('words')
        .select('views')
        .eq('id', wordId)
        .single();

      if (fetchError || !currentWord) {
        console.error('Error fetching current views:', fetchError);
        return false;
      }

      // เพิ่ม views
      const { error: updateError } = await supabase
        .from('words')
        .update({ views: currentWord.views + 1 })
        .eq('id', wordId);

      if (updateError) {
        console.error('Error incrementing view:', updateError);
        return false;
      }

      console.log(`View incremented for word: ${wordId}`);
      return true;
    } catch (error) {
      console.error('Error in incrementView:', error);
      return false;
    }
  },

  /**
   * ดึงคำศัพท์ที่เกี่ยวข้อง (เฉพาะคำในหมวดหมู่เดียวกัน)
   */
  async getRelatedWords(wordId: string): Promise<RelatedWord[]> {
    try {
      const { data: currentWord, error: currentWordError } = await supabase
        .from('words')
        .select('category_id')
        .eq('id', wordId)
        .single();

      if (currentWordError || !currentWord) {
        console.error('Error fetching current word:', currentWordError);
        return [];
      }

      const { data, error } = await supabase
        .from('words')
        .select(`
          id,
          word,
          thumbnail_url,
          category:categories(name)
        `)
        .eq('category_id', currentWord.category_id)
        .neq('id', wordId)
        .order('views', { ascending: false })
        .limit(15);

      if (error) throw error;
      if (!data) return [];

      return data.map((item: any) => ({
        id: item.id,
        word: item.word,
        category: item.category?.name || 'ไม่ระบุหมวดหมู่',
        thumbnail_url: item.thumbnail_url
      }));
    } catch (error) {
      console.error('Error fetching related words:', error);
      return [];
    }
  },

  /**
   * ค้นหาคำศัพท์
   */
  async searchWords(query: string, categoryId?: string, limit = 20) {
    try {
      let queryBuilder = supabase
        .from('words')
        .select(`
          *,
          category:categories(id, name, name_en)
        `);

      if (query && query.trim()) {
        queryBuilder = queryBuilder.ilike('word', `%${query.trim()}%`);
      }

      if (categoryId) {
        queryBuilder = queryBuilder.eq('category_id', categoryId);
      }

      const { data, error } = await queryBuilder
        .order('views', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching words:', error);
      return [];
    }
  },

  /**
   * ดึงคำศัพท์ยอดนิยม (featured)
   */
  async getFeaturedWords(limit = 4) {
    try {
      const { data, error } = await supabase
        .from('words')
        .select(`
          *,
          category:categories(id, name, name_en)
        `)
        .eq('is_featured', true)
        .order('views', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching featured words:', error);
      return [];
    }
  },

  /**
   * ดึงหมวดหมู่ทั้งหมด
   */
  async getAllCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  /**
   * ดึงคำศัพท์ตามหมวดหมู่
   */
  async getWordsByCategory(categoryName: string, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('words')
        .select(`
          *,
          category:categories!inner(id, name, name_en)
        `)
        .eq('category.name', categoryName)
        .order('views', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching words by category:', error);
      return [];
    }
  }
};