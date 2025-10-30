const express = require('express');
const { supabase } = require('../lib/supabase');
const { authenticateUser, requireAdmin } = require('../middleware/supabaseAuth');

const router = express.Router();

// Get all pending submissions (Admin only)
router.get('/submissions/pending', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('submitted_words')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Admin error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ไม่สามารถดึงข้อมูลได้' 
    });
  }
});

// Approve submission and add to main database
router.post('/submissions/:id/approve', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.body;

    // Get submission details
    const { data: submission, error: fetchError } = await supabase
      .from('submitted_words')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !submission) {
      return res.status(404).json({ 
        success: false, 
        message: 'ไม่พบข้อมูล' 
      });
    }

    // Add to main phrases table
    const { data: newPhrase, error: insertError } = await supabase
      .from('tsl_phrases')
      .insert({
        word: submission.word_text,
        description: submission.description,
        video_url: submission.video_url,
        category: category || 'อื่นๆ',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Update submission status
    const { error: updateError } = await supabase
      .from('submitted_words')
      .update({ 
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: 'อนุมัติสำเร็จ',
      data: newPhrase
    });

  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ไม่สามารถอนุมัติได้' 
    });
  }
});

// Reject submission
router.post('/submissions/:id/reject', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { error } = await supabase
      .from('submitted_words')
      .update({ 
        status: 'rejected',
        rejection_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'ปฏิเสธสำเร็จ'
    });

  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ไม่สามารถปฏิเสธได้' 
    });
  }
});

// Get dashboard statistics
router.get('/dashboard/stats', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const [phrasesResult, usersResult, submissionsResult, reviewsResult] = await Promise.all([
      supabase.from('tsl_phrases').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('submitted_words').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('website_reviews').select('rating')
    ]);

    const avgRating = reviewsResult.data && reviewsResult.data.length > 0
      ? reviewsResult.data.reduce((sum, r) => sum + r.rating, 0) / reviewsResult.data.length
      : 0;

    res.json({
      success: true,
      data: {
        totalPhrases: phrasesResult.count || 0,
        totalUsers: usersResult.count || 0,
        pendingSubmissions: submissionsResult.count || 0,
        averageRating: avgRating.toFixed(1),
        totalReviews: reviewsResult.data?.length || 0
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ไม่สามารถดึงข้อมูลได้' 
    });
  }
});

module.exports = router;