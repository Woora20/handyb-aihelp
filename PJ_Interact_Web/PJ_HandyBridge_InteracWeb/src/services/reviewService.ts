// src/services/reviewService.ts
import { supabase } from '../lib/supabase';

export interface WebsiteReview {
  id: string;
  reviewer_name: string;
  reviewer_email: string;
  rating: number;
  review_comment: string;
  favorite_feature?: string;
  new_feature_request?: string;
  understanding_level?: string;
  created_at: string;
  user_id?: string;
}

export class ReviewService {
  // ดึงรีวิวแบบ Smart Ranking (เลือกรีวิวดีๆ มาแสดง)
  async getSmartReviews(): Promise<WebsiteReview[]> {
    try {
      const { data, error } = await supabase
        .from('website_reviews')
        .select('*')
        .gte('rating', 3) // ขั้นต่ำ 3 ดาว
        .not('review_comment', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50); // ดึงมา 50 รายการแล้วค่อยคัดเลือก

      if (error) throw error;

      if (!data || data.length === 0) return [];

      // คำนวณ score และเรียงลำดับ
      const scoredReviews = data.map(review => {
        const score = this.calculateReviewScore(review);
        return { ...review, score };
      });

      // เรียงตาม score สูงสุดก่อน และเอา 15 อันดับแรก
      return scoredReviews
        .sort((a, b) => b.score - a.score)
        .slice(0, 15);
        
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  }

  // คำนวณคะแนนรีวิว
  private calculateReviewScore(review: WebsiteReview): number {
    let score = 0;

    // 1. Rating Weight (40%) - คะแนนดาวมีผลมาก
    score += review.rating * 8; // 5 ดาว = 40 คะแนน

    // 2. Content Quality (30%) - ความยาวและคุณภาพ comment
    const commentLength = review.review_comment?.length || 0;
    if (commentLength > 100) score += 30;      // comment ยาว = ละเอียด
    else if (commentLength > 50) score += 20;  // comment กลาง
    else if (commentLength > 20) score += 10;  // comment สั้น

    // 3. Freshness (20%) - ความใหม่
    const daysOld = this.getDaysOld(review.created_at);
    if (daysOld <= 7) score += 20;        // อาทิตย์นี้
    else if (daysOld <= 30) score += 15;  // เดือนนี้
    else if (daysOld <= 90) score += 10;  // 3 เดือน
    else if (daysOld <= 180) score += 5;  // 6 เดือน

    // 4. Completeness (10%) - กรอกข้อมูลครบ
    if (review.favorite_feature) score += 5;
    if (review.understanding_level) score += 5;

    return score;
  }

  // คำนวณว่ารีวิวเก่ากี่วัน
  private getDaysOld(dateString: string): number {
    const created = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // ตรวจสอบว่ารีวิวใหม่ไหม (ภายใน 7 วัน)
  isNewReview(dateString: string): boolean {
    return this.getDaysOld(dateString) <= 7;
  }

  // สร้าง avatar URL
  getAvatarUrl(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4b648b&color=fff&size=100`;
  }

  // ดึงรีวิวแบบเดิม (backup)
  async getGoodReviews(): Promise<WebsiteReview[]> {
    try {
      const { data, error } = await supabase
        .from('website_reviews')
        .select('*')
        .gte('rating', 4)
        .order('created_at', { ascending: false })
        .limit(15);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  }
}

export const reviewService = new ReviewService();