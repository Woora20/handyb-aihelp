// src/utils/viewTracker.ts

/**
 * View Tracker สำหรับนับ views แบบมีเงื่อนไข
 * 1 view = ดูอย่างน้อย 10 วินาที + ไม่นับซ้ำภายใน 24 ชม.
 */

const STORAGE_KEY = 'handy_bridge_viewed_words';
const VIEW_THRESHOLD_MS = 10000; // 10 วินาที
const VIEW_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 ชั่วโมง

interface ViewedWord {
  wordId: string;
  timestamp: number;
}

interface ActiveSession {
  wordId: string;
  startTime: number;
  timer: number | null;
  hasRecorded: boolean;
}

class ViewTracker {
  private activeSessions: Map<string, ActiveSession> = new Map();

  /**
   * เริ่มติดตามการดูคำศัพท์
   */
  startTracking(wordId: string, onViewRecorded?: () => void): void {
    // เช็คว่าเคยดูภายใน 24 ชั่วโมงหรือไม่
    if (this.hasRecentView(wordId)) {
      console.log('Already viewed this word within 24 hours');
      return;
    }

    // เช็คว่ามี session อยู่แล้วหรือไม่
    if (this.activeSessions.has(wordId)) {
      console.log('Session already active for this word');
      return;
    }

    const session: ActiveSession = {
      wordId,
      startTime: Date.now(),
      timer: null,
      hasRecorded: false
    };

    // ตั้ง timer เพื่อบันทึก view หลัง 10 วินาที
    session.timer = window.setTimeout(() => {
      this.recordView(wordId);
      session.hasRecorded = true;
      
      // Callback เมื่อบันทึก view สำเร็จ
      if (onViewRecorded) {
        onViewRecorded();
      }
    }, VIEW_THRESHOLD_MS);

    this.activeSessions.set(wordId, session);
    console.log(`Started tracking view for word: ${wordId}`);
  }

  /**
   * หยุดติดตาม (เมื่อออกจากหน้า)
   */
  stopTracking(wordId: string): void {
    const session = this.activeSessions.get(wordId);
    
    if (session) {
      // ยกเลิก timer ถ้ายังไม่ถึง 10 วินาที
      if (session.timer) {
        clearTimeout(session.timer);
      }

      const timeSpent = Date.now() - session.startTime;
      console.log(`Stopped tracking. Time spent: ${timeSpent}ms, Recorded: ${session.hasRecorded}`);
      
      this.activeSessions.delete(wordId);
    }
  }

  /**
   * บันทึก view ลง localStorage
   */
  private recordView(wordId: string): void {
    const viewedWords = this.getViewedWords();
    
    // เพิ่มข้อมูลการดู
    viewedWords.push({
      wordId,
      timestamp: Date.now()
    });

    // บันทึกลง localStorage
    this.saveViewedWords(viewedWords);
    console.log(`View recorded for word: ${wordId}`);
  }

  /**
   * เช็คว่าเคยดูคำนี้ภายใน 24 ชั่วโมงหรือไม่
   */
  private hasRecentView(wordId: string): boolean {
    const viewedWords = this.getViewedWords();
    const now = Date.now();

    return viewedWords.some(
      (view) =>
        view.wordId === wordId &&
        now - view.timestamp < VIEW_COOLDOWN_MS
    );
  }

  /**
   * ดึงประวัติการดูจาก localStorage
   */
  private getViewedWords(): ViewedWord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const parsed: ViewedWord[] = JSON.parse(data);
      const now = Date.now();

      // กรองเฉพาะข้อมูลที่ยังไม่หมดอายุ (ภายใน 24 ชั่วโมง)
      return parsed.filter((view) => now - view.timestamp < VIEW_COOLDOWN_MS);
    } catch (error) {
      console.error('Error reading viewed words:', error);
      return [];
    }
  }

  /**
   * บันทึกประวัติลง localStorage
   */
  private saveViewedWords(viewedWords: ViewedWord[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(viewedWords));
    } catch (error) {
      console.error('Error saving viewed words:', error);
    }
  }

  /**
   * ดึงสถิติการดู (สำหรับ debug)
   */
  getStats(): { totalViewed: number; viewedToday: ViewedWord[] } {
    const viewedWords = this.getViewedWords();
    return {
      totalViewed: viewedWords.length,
      viewedToday: viewedWords
    };
  }

  /**
   * ล้างประวัติทั้งหมด (สำหรับ testing)
   */
  clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      this.activeSessions.clear();
      console.log('View history cleared');
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }
}

// Export singleton instance
export const viewTracker = new ViewTracker();