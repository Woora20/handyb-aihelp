// src/services/submitWordService.ts
import { supabase } from '../lib/supabase';

export interface SubmittedWord {
  word_text: string;
  video_url?: string;
  description?: string;
  submitter_name: string;
  submitter_email: string;
  user_id?: string;  // 🔥 optional string
}

export interface SubmittedWordDB extends SubmittedWord {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export class SubmitWordService {
  async uploadVideo(file: File): Promise<string> {
    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `submissions/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('word-videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('word-videos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('ไม่สามารถอัพโหลดวิดีโอได้');
    }
  }

  async submitWord(data: SubmittedWord): Promise<void> {
    try {
      const { error } = await supabase
        .from('submitted_words')
        .insert([{
          ...data,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Submit error:', error);
      throw new Error('ไม่สามารถส่งข้อมูลได้');
    }
  }

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
}

export const submitWordService = new SubmitWordService();