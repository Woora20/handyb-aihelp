// src/services/mediaService.ts
import { supabase } from '../lib/supabase';

export type MediaType = 'video' | 'gif' | 'youtube' | 'external_url';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const mediaService = {
  /**
   * อัพโหลดไฟล์ (Video หรือ GIF)
   */
  async uploadFile(
    file: File,
    wordId: string,
    mediaType: 'video' | 'gif'
  ): Promise<UploadResult> {
    try {
      // ตรวจสอบขนาดไฟล์ (ไม่เกิน 20MB)
      const maxSize = 20 * 1024 * 1024; // 20MB
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'ไฟล์มีขนาดใหญ่เกินไป (ไม่เกิน 20MB)'
        };
      }

      // ตรวจสอบประเภทไฟล์
      const allowedTypes = {
        video: ['video/mp4', 'video/webm', 'video/quicktime'],
        gif: ['image/gif']
      };

      if (!allowedTypes[mediaType].includes(file.type)) {
        return {
          success: false,
          error: `ประเภทไฟล์ไม่ถูกต้อง (รองรับ: ${allowedTypes[mediaType].join(', ')})`
        };
      }

      // สร้างชื่อไฟล์
      const fileExt = file.name.split('.').pop();
      const fileName = `${wordId}-${Date.now()}.${fileExt}`;
      const folder = mediaType === 'gif' ? 'gifs' : 'videos';
      const filePath = `${folder}/${fileName}`;

      // อัพโหลด
      const { data, error } = await supabase.storage
        .from('sign-language-videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return {
          success: false,
          error: 'เกิดข้อผิดพลาดในการอัพโหลด'
        };
      }

      // ดึง Public URL
      const { data: urlData } = supabase.storage
        .from('sign-language-videos')
        .getPublicUrl(filePath);

      return {
        success: true,
        url: urlData.publicUrl
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดที่ไม่คาดคิด'
      };
    }
  },

  /**
   * ตรวจสอบ YouTube URL
   */
  validateYouTubeUrl(url: string): { valid: boolean; embedUrl?: string; error?: string } {
    try {
      // Pattern สำหรับ YouTube URL
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          const videoId = match[1];
          return {
            valid: true,
            embedUrl: `https://www.youtube.com/embed/${videoId}`
          };
        }
      }

      return {
        valid: false,
        error: 'URL ของ YouTube ไม่ถูกต้อง'
      };
    } catch (error) {
      return {
        valid: false,
        error: 'URL ไม่ถูกต้อง'
      };
    }
  },

  /**
   * ตรวจสอบ External URL (GIF, วิดีโอ)
   */
  async validateExternalUrl(url: string): Promise<{ valid: boolean; error?: string }> {
    try {
      // ตรวจสอบว่าเป็น URL ที่ถูกต้อง
      new URL(url);

      // ตรวจสอบว่าเข้าถึงได้
      const response = await fetch(url, { method: 'HEAD' });
      
      if (response.ok) {
        return { valid: true };
      } else {
        return {
          valid: false,
          error: 'ไม่สามารถเข้าถึง URL ได้'
        };
      }
    } catch (error) {
      return {
        valid: false,
        error: 'URL ไม่ถูกต้อง'
      };
    }
  },

  /**
   * บันทึก Media ลง Database
   */
  async saveMediaToWord(
    wordId: string,
    mediaUrl: string,
    mediaType: MediaType,
    thumbnailUrl?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('words')
        .update({
          video_url: mediaUrl,
          media_type: mediaType,
          ...(thumbnailUrl && { thumbnail_url: thumbnailUrl })
        })
        .eq('id', wordId);

      if (error) {
        console.error('Database update error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving media:', error);
      return false;
    }
  },

  /**
   * ลบไฟล์ออกจาก Storage
   */
  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/sign-language-videos/');
      if (urlParts.length < 2) return false;

      const filePath = urlParts[1];

      const { error } = await supabase.storage
        .from('sign-language-videos')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
};