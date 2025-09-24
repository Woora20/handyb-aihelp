// src/test-gemini.ts - แก้ไขใหม่
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY!);

async function testGemini() {
  try {
    // 🔄 เปลี่ยนจาก "gemini-pro" เป็น "gemini-1.5-flash"
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("สวัสดี ทดสอบภาษาไทย");
    const response = await result.response;
    console.log("✅ Gemini API ทำงานได้:", response.text());
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
  }
}

testGemini();