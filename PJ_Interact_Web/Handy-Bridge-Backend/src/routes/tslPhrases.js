// src/routes/tslPhrases.js
const express = require("express");
const { supabase } = require("../lib/supabase");

const router = express.Router();

// Get all phrases with filtering and pagination
router.get("/", async (req, res) => {
  try {
    const { category, search, limit = 10, offset = 0 } = req.query;

    let query = supabase.from("words").select(
      `
        *,
        category:categories(id, name, name_en)
      `,
      { count: "exact" }
    );

    // Filter by category name
    if (category && category !== "ทั้งหมด") {
      query = query.eq("categories.name", category);
    }

    // Search functionality
    if (search) {
      query = query.ilike("word", `%${search}%`);
    }

    // Pagination
    query = query
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
      .order("created_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        message: "ไม่สามารถดึงข้อมูลได้",
      });
    }

    res.json({
      success: true,
      data: data || [],
      total: count || 0,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์",
    });
  }
});

// Increment view count
router.post("/:id/view", async (req, res) => {
  try {
    const { id } = req.params;

    // Get current views
    const { data: word, error: fetchError } = await supabase
      .from("words")
      .select("views")
      .eq("id", id)
      .single();

    if (fetchError || !word) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบคำศัพท์",
      });
    }

    // Increment views
    const { error: updateError } = await supabase
      .from("words")
      .update({ views: (word.views || 0) + 1 })
      .eq("id", id);

    if (updateError) throw updateError;

    res.json({ success: true, message: "บันทึกการดูสำเร็จ" });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
    });
  }
});

// Get related words
// Get related words
router.get("/:id/related", async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 15 } = req.query;

    // Get current word's category
    const { data: currentWord, error: currentError } = await supabase
      .from("words")
      .select("category_id")
      .eq("id", id)
      .single();

    if (currentError || !currentWord) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบคำศัพท์",
      });
    }

    // Get related words from same category
    const { data, error } = await supabase
      .from("words")
      .select(
        `
        id,
        word,
        thumbnail_url,
        category:categories(name)
      `
      )
      .eq("category_id", currentWord.category_id)
      .neq("id", id)
      .order("views", { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    const relatedWords = (data || []).map((item) => ({
      id: item.id,
      word: item.word,
      category: item.category?.name || "ไม่ระบุหมวดหมู่",
      thumbnail_url: item.thumbnail_url,
    }));

    res.json({ success: true, data: relatedWords });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
    });
  }
});

// Get featured words
router.get("/featured", async (req, res) => {
  try {
    const { limit = 4 } = req.query;

    const { data, error } = await supabase
      .from("words")
      .select(
        `
        *,
        category:categories(id, name, name_en)
      `
      )
      .eq("is_featured", true)
      .order("views", { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
    });
  }
});

// Get single phrase by ID
router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("words")
      .select(
        `
        *,
        category:categories(id, name, name_en)
      `
      )
      .eq("id", req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบคำศัพท์",
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
    });
  }
});

// Get all categories
router.get("/meta/categories", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;

    const categoryNames = ["ทั้งหมด", ...(data?.map((c) => c.name) || [])];

    res.json({
      success: true,
      data: categoryNames,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
      data: ["ทั้งหมด", "การทักทาย", "ครอบครัว", "อาหาร", "อารมณ์", "ฉุกเฉิน"],
    });
  }
});

// Get phrase statistics
router.get("/meta/stats", async (req, res) => {
  try {
    const { count: totalPhrases } = await supabase
      .from("words")
      .select("*", { count: "exact", head: true });

    const { data: categories } = await supabase
      .from("categories")
      .select("name");

    res.json({
      success: true,
      data: {
        totalPhrases: totalPhrases || 0,
        totalCategories: categories?.length || 0,
        categories: categories?.map((c) => c.name) || [],
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
    });
  }
});

module.exports = router;
