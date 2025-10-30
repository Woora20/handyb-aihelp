const { supabase } = require('../lib/supabase');

// Verify Supabase JWT token from frontend
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'ต้องการ token การเข้าสู่ระบบ' });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
    }

    // Get user profile from Supabase
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    req.user = user;
    req.profile = profile;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์' });
  }
};

// Check if user has admin role
const requireAdmin = async (req, res, next) => {
  // Check if profile has admin role (you need to add this field to your profiles table)
  if (!req.profile || req.profile.role !== 'admin') {
    return res.status(403).json({ message: 'ต้องการสิทธิ์ผู้ดูแลระบบ' });
  }
  next();
};

module.exports = {
  authenticateUser,
  requireAdmin
};