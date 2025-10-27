// src/services/submitWordService.ts
import { supabase } from '../lib/supabase';

export interface SubmittedWord {
  word_text: string;
  video_url?: string;
  video_file?: File;  // 🔥 เพิ่ม: ไฟล์วิดีโอ
  gif_url?: string;   // 🔥 เพิ่ม: URL ของ GIF
  description?: string;
  submitter_name: string;
  submitter_email: string;
  user_id?: string;
}

export interface SubmittedWordDB extends SubmittedWord {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export class SubmitWordService {
  /**
   * อัพโหลดวิดีโอหรือ GIF ไปยัง Supabase Storage
   */
  async uploadVideo(file: File): Promise<string> {
    try {
      // ตรวจสอบชนิดไฟล์
      const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        throw new Error('รองรับเฉพาะไฟล์ MP4, WebM, MOV หรือ GIF');
      }

      // ตรวจสอบขนาดไฟล์ (50MB)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('ไฟล์ต้องมีขนาดไม่เกิน 50MB');
      }

      // สร้างชื่อไฟล์ที่ไม่ซ้ำ
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${randomString}.${fileExt}`;
      const filePath = `submissions/${fileName}`;
      
      console.log('Uploading file:', fileName);

      // อัพโหลดไปยัง Supabase Storage
      const { data, error } = await supabase.storage
        .from('word-videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // ดึง Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('word-videos')
        .getPublicUrl(filePath);

      console.log('Upload successful:', publicUrl);
      return publicUrl;

    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(error instanceof Error ? error.message : 'ไม่สามารถอัพโหลดไฟล์ได้');
    }
  }

  /**
   * ตรวจสอบว่า URL เป็น GIF หรือไม่
   */
  isGifUrl(url: string): boolean {
    return url.toLowerCase().endsWith('.gif') || 
           url.toLowerCase().includes('.gif?') ||
           url.includes('giphy.com') ||
           url.includes('tenor.com');
  }

  /**
   * บันทึกข้อมูลคำศัพท์ใหม่
   */
  async submitWord(data: SubmittedWord): Promise<void> {
    try {
      let videoUrl = data.video_url;
      let gifUrl = data.gif_url;

      // ถ้ามีไฟล์วิดีโอให้อัพโหลด
      if (data.video_file) {
        console.log('Uploading video file...');
        videoUrl = await this.uploadVideo(data.video_file);
        
        // เช็คว่าเป็น GIF หรือไม่
        if (this.isGifUrl(videoUrl)) {
          gifUrl = videoUrl;
        }
      }

      // บันทึกลงฐานข้อมูล
      const { error } = await supabase
        .from('submitted_words')
        .insert([{
          word_text: data.word_text,
          video_url: videoUrl,
          gif_url: gifUrl,
          description: data.description,
          submitter_name: data.submitter_name,
          submitter_email: data.submitter_email,
          user_id: data.user_id,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      console.log('Word submitted successfully');
    } catch (error) {
      console.error('Submit error:', error);
      throw new Error(error instanceof Error ? error.message : 'ไม่สามารถส่งข้อมูลได้');
    }
  }

  /**
   * ดึงรายการคำที่ส่งมา
   */
  async getSubmissions(): Promise<SubmittedWordDB[]> {
    try {
      const { data, error } = await supabase
        .from('submitted_words')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SubmittedWordDB[];
    } catch (error) {
      console.error('Fetch error:', error);
      return [];
    }
  }

  /**
   * ลบไฟล์ออกจาก Storage (สำหรับยกเลิกหรือลบ)
   */
  async deleteVideo(videoUrl: string): Promise<boolean> {
    try {
      // ดึง path จาก URL
      const urlParts = videoUrl.split('/word-videos/');
      if (urlParts.length < 2) return false;
      
      const filePath = urlParts[1];

      const { error } = await supabase.storage
        .from('word-videos')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }
}

export const submitWordService = new SubmitWordService();