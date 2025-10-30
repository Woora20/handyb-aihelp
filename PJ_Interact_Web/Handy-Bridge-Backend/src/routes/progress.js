// src/routes/progress.js
const express = require('express');
const { supabase } = require('../lib/supabase');
const { authenticateUser } = require('../middleware/supabaseAuth');

const router = express.Router();

// Record when user completes a lesson
router.post('/complete', authenticateUser, async (req, res) => {
  try {
    const { phraseId, timeSpent, score } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('user_progress')
      .insert({
        user_id: userId,
        phrase_id: phraseId,
        completed_at: new Date().toISOString(),
        time_spent: timeSpent,
        score: score || 100
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'บันทึกความคืบหน้าสำเร็จ',
      data
    });

  } catch (error) {
    console.error('Progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ไม่สามารถบันทึกได้' 
    });
  }
});

// Get user's learning statistics
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total completed phrases
    const { count: totalCompleted } = await supabase
      .from('user_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get learning streak
    const { data: recentProgress } = await supabase
      .from('user_progress')
      .select('completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(30);

    const streak = calculateStreak(recentProgress || []);

    // Get total time spent
    const { data: timeData } = await supabase
      .from('user_progress')
      .select('time_spent')
      .eq('user_id', userId);

    const totalTime = timeData?.reduce((sum, item) => sum + (item.time_spent || 0), 0) || 0;

    // Get average score
    const { data: scoreData } = await supabase
      .from('user_progress')
      .select('score')
      .eq('user_id', userId);

    const avgScore = scoreData && scoreData.length > 0
      ? scoreData.reduce((sum, item) => sum + item.score, 0) / scoreData.length
      : 0;

    res.json({
      success: true,
      data: {
        totalCompleted: totalCompleted || 0,
        streak,
        totalTimeMinutes: Math.round(totalTime / 60),
        averageScore: Math.round(avgScore)
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ไม่สามารถดึงสถิติได้' 
    });
  }
});

// Get user's recent activity
router.get('/recent', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        *,
        words (
          word,
          video_url,
          category:categories(name)
        )
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ไม่สามารถดึงข้อมูลได้' 
    });
  }
});

// Helper function to calculate streak
function calculateStreak(progressData) {
  if (progressData.length === 0) return 0;
  
  const dates = progressData
    .map(p => new Date(p.completed_at).toDateString())
    .filter((date, index, self) => self.indexOf(date) === index)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const dateStr of dates) {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak) {
      streak++;
      currentDate = date;
    } else if (diffDays > streak) {
      break;
    }
  }
  
  return streak;
}

module.exports = router;