// src/services/openaiService.ts
import OpenAI from 'openai';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export class OpenAIService {
  async sendMessage(message: string, chatHistory: ChatMessage[] = []): Promise<string> {
    try {
      const messages = [
        {
          role: 'system' as const,
          content: `คุณคือ "HandyBot" ผู้ช่วย AI สำหรับการเรียนรู้ภาษามือไทย

บทบาท:
- ตอบคำถามภาษามือไทยด้วยความถูกต้อง
- แนะนำท่าทางและวิธีการสื่อสาร  
- อธิบายคำศัพท์และความหมาย
- ให้คำแนะนำที่เข้าใจง่าย

หลักการตอบ:
1. ใช้ภาษาไทยกระชับชัดเจน
2. คำง่าย เหมาะผู้เริ่มต้น
3. ให้ตัวอย่างประโยชน์  
4. หากไม่แน่ใจให้บอกตรงๆ
5. เป็นมิตรให้กำลังใจ
6. ตอบเป็น plain text ธรรมดา ไม่ใช้ markdown, bullet points, หรือสัญลักษณ์พิเศษ
7. เขียนเป็นประโยคปกติ แบ่งย่อหน้าด้วยการเว้นบรรทัด`
        },
        ...chatHistory.slice(-4).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user' as const,
          content: message
        }
      ];

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 800,
        temperature: 0.8,
      });

      return response.choices[0]?.message?.content || 'ขออภัย ไม่สามารถตอบได้';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('insufficient_quota') || error.message.includes('billing')) {
          throw new Error('บัญชี OpenAI หมดเครดิต กรุณาเติมเงิน');
        }
        if (error.message.includes('invalid_api_key')) {
          throw new Error('API Key ไม่ถูกต้อง กรุณาตรวจสอบ');
        }
        if (error.message.includes('rate_limit')) {
          throw new Error('ใช้งานเร็วเกินไป กรุณารอสักครู่');
        }
      }
      
      throw new Error('ขออภัย เกิดข้อผิดพลาดในการติดต่อ AI');
    }
  }
}

export const openaiService = new OpenAIService();