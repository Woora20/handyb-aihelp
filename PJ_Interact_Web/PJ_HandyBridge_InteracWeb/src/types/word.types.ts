// src/types/word.types.ts
export interface Category {
  id: string;
  name: string;
  name_en?: string;
  icon_url?: string;
  display_order: number;
  created_at?: string;
}

export interface Word {
  id: string;
  word: string;
  category_id: string;
  category?: Category; // มาจาก join กับ table categories
  description: string;
  word_type: string;
  organization: string;
  reference: string;
  production_date: string;
  submitter: string;
  video_url: string;
  thumbnail_url?: string;
  views: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface RelatedWord {
  id: string;
  word: string;
  category: string;
  thumbnail_url?: string;
}

export interface WordWithCategory extends Word {
  category: Category;
}