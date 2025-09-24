// src/services/geminiService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY!);

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      maxOutputTokens: 800,
      temperature: 0.8,
      topP: 0.9,
      topK: 40,
    }
  });
  
  private systemPrompt = `คุณคือ "HandyBot" ผู้ช่วย AI สำหรับการเรียนรู้ภาษามือไทย

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
5. เป็นมิตรให้กำลังใจ`;

  async sendMessage(message: string, chatHistory: ChatMessage[] = []): Promise<string> {
    const maxRetries = 5; // เพิ่มจาก 3 เป็น 5
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // รอก่อนส่ง request (ยกเว้นครั้งแรก)
        if (attempt > 0) {
          const delay = Math.min(1000 + (attempt * 2000), 10000); // 1s, 3s, 5s, 7s, 9s
          console.log(`รอ ${delay/1000} วินาที แล้วลองใหม่... (ครั้งที่ ${attempt + 1})`);
          await this.sleep(delay);
        }

        const context = this.buildContext(chatHistory);
        const prompt = `${this.systemPrompt}\n\n${context}\n\nUser: ${message}\nHandyBot:`;
        
        const result = await this.model.generateContent(prompt);
        const response = result.response;
        
        if (!response) {
          throw new Error('ไม่ได้รับการตอบกลับ');
        }
        
        return response.text().trim();
      } catch (error) {
        console.error(`ความพยายามครั้งที่ ${attempt + 1} ล้มเหลว:`, error);
        lastError = error as Error;
      }
    }

    // จัดการ error ตามประเภท
    if (lastError) {
      const errorMessage = lastError.message.toLowerCase();
      
      if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
        throw new Error('🤖 AI กำลังใช้งานหนักมาก กรุณารอ 2-3 นาทีแล้วลองใหม่นะครับ');
      }
      if (errorMessage.includes('api_key') || errorMessage.includes('401')) {
        throw new Error('🔑 ปัญหา API Key กรุณาตรวจสอบการตั้งค่า');
      }
      if (errorMessage.includes('429') || errorMessage.includes('quota')) {
        throw new Error('⏰ ใช้งานเกินขีดจำกัด กรุณารอ 5 นาทีแล้วลองใหม่');
      }
      if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
        throw new Error('📶 ปัญหาการเชื่อมต่อ กรุณาตรวจสอบอินเทอร์เน็ต');
      }
    }
    
    throw new Error('❌ ไม่สามารถติดต่อ AI ได้ในขณะนี้ กรุณาลองใหม่ภายหลัง');
  }

  private buildContext(history: ChatMessage[]): string {
    if (history.length === 0) return '';
    
    return history
      .slice(-3) // ลดจาก 4 เป็น 3 เพื่อประหยัด load
      .map(msg => `${msg.role === 'user' ? 'User' : 'HandyBot'}: ${msg.content}`)
      .join('\n');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const geminiService = new GeminiService();