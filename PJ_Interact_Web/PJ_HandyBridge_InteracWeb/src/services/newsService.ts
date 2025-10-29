// src/services/newsService.ts
import axios from "axios";
import type { NewsArticle, NewsCategory } from "../types/news.types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

interface GetNewsParams {
  category?: string;
  limit?: number;
  query?: string; // ⬅️ เพิ่ม query parameter
}

interface NewsApiResponse {
  success: boolean;
  data: NewsArticle[];
  total: number;
  message?: string;
}

interface CategoriesApiResponse {
  success: boolean;
  data: NewsCategory[];
}

export const newsService = {
  // ดึงรายการข่าว
  async getNews(params: GetNewsParams = {}): Promise<NewsArticle[]> {
    try {
      const { category = "general", limit = 10, query } = params;
      
      const response = await axios.get<NewsApiResponse>(
        `${API_BASE_URL}/news`,
        {
          params: { 
            category, 
            limit,
            // ⬇️ เพิ่ม query สำหรับค้นหาข่าวเกี่ยวกับภาษามือ
            q: query || "sign language OR ภาษามือ OR คนหูหนวก OR deaf"
          },
        }
      );

      if (response.data.success) {
        return response.data.data;
      }
      
      console.warn("News API returned unsuccessful response");
      return [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("News API error:", error.response?.data || error.message);
      } else {
        console.error("Error fetching news:", error);
      }
      throw error;
    }
  },

  // ดึงหมวดหมู่ข่าว
  async getCategories(): Promise<NewsCategory[]> {
    try {
      const response = await axios.get<CategoriesApiResponse>(
        `${API_BASE_URL}/news/categories`
      );

      if (response.data.success) {
        return response.data.data;
      }
      
      console.warn("Categories API returned unsuccessful response");
      return [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Categories API error:", error.response?.data || error.message);
      } else {
        console.error("Error fetching categories:", error);
      }
      throw error;
    }
  },

  // ดึงข่าวแต่ละชิ้น
  async getNewsById(id: string): Promise<NewsArticle | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/news/${id}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching news by ID:", error);
      throw error;
    }
  },
};