// src/types/news.types.ts
export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  imageUrl: string;
  source: string;
  author: string;
  publishedAt: string;
  category?: {
    id: string;
    th: string;
    en: string;
  };
}

export interface NewsCategory {
  id: string;
  name: string;
  name_en: string;
}