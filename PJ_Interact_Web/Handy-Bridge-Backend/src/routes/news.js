const express = require("express");
const axios = require("axios");
const router = express.Router();

// ⬇️ ฟังก์ชันจับหมวดหมู่ + คำนวณคะแนน
function categorizeAndScore(article) {
  const text = `${article.title} ${article.description}`.toLowerCase();
  let score = 0;

  // ภาษามือ (สูงสุด)
  if (text.match(/sign language|deaf|hearing impaired|asl|bsl/)) {
    score += 10;
    return {
      category: { id: "sign-language", th: "ภาษามือ", en: "Sign Language" },
      score,
    };
  }

  // การศึกษา
  if (text.match(/education|school|student|learning|inclusive/)) {
    score += 5;
    return {
      category: { id: "education", th: "การศึกษา", en: "Education" },
      score,
    };
  }

  // สุขภาพ
  if (text.match(/health|medical|hospital|treatment/)) {
    score += 4;
    return {
      category: { id: "healthcare", th: "สุขภาพ", en: "Healthcare" },
      score,
    };
  }

  // เทคโนโลยี
  if (text.match(/technology|app|ai|assistive|digital/)) {
    score += 4;
    return {
      category: { id: "technology", th: "เทคโนโลยี", en: "Technology" },
      score,
    };
  }

  // การเข้าถึง
  if (text.match(/accessibility|accessible|barrier-free/)) {
    score += 3;
    return {
      category: { id: "accessibility", th: "การเข้าถึง", en: "Accessibility" },
      score,
    };
  }

  // ประกันภัย
  if (text.match(/insurance|coverage|benefit/)) {
    score += 2;
    return {
      category: { id: "insurance", th: "ประกันภัย", en: "Insurance" },
      score,
    };
  }

  // ผู้พิการ
  if (text.match(/disability|disabled|disabilities/)) {
    score += 3;
    return {
      category: { id: "disability", th: "ผู้พิการ", en: "Disability" },
      score,
    };
  }

  // Default
  return { category: { id: "general", th: "ทั่วไป", en: "General" }, score: 1 };
}

// Get news articles
router.get("/", async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    let allArticles = [];

    // ========== 1. The Guardian ==========
    try {
      const guardianResponse = await axios.get(
        "https://content.guardianapis.com/search",
        {
          params: {
            q: "disability OR accessibility OR sign language OR deaf OR education OR healthcare",
            "page-size": 20,
            "order-by": "newest",
            "show-fields": "thumbnail,trailText,byline",
            "api-key": process.env.GUARDIAN_API_KEY,
          },
        }
      );

      if (guardianResponse.data.response.status === "ok") {
        allArticles = guardianResponse.data.response.results.map((a) => {
          const article = {
            id: a.id,
            title: a.webTitle,
            description: a.fields?.trailText || a.webTitle,
            url: a.webUrl,
            imageUrl: a.fields?.thumbnail || null,
            source: "The Guardian",
            author: a.fields?.byline || "The Guardian",
            publishedAt: a.webPublicationDate,
          };
          const { category, score } = categorizeAndScore(article);
          return { ...article, category, score };
        });
      }
    } catch (err) {
      console.warn("⚠️ Guardian failed:", err.message);
    }

    // ========== 2. NewsAPI.org ==========
    try {
      const newsResponse = await axios.get(
        "https://newsapi.org/v2/everything",
        {
          params: {
            q: "(disability OR accessibility) AND (education OR healthcare OR technology)",
            sortBy: "publishedAt",
            language: "en",
            pageSize: 20,
            apiKey: process.env.NEWS_API_KEY,
          },
        }
      );

      if (newsResponse.data.status === "ok") {
        const newsArticles = newsResponse.data.articles.map((a) => {
          const article = {
            id: a.url,
            title: a.title,
            description: a.description || a.title,
            url: a.url,
            imageUrl: a.urlToImage,
            source: a.source.name,
            author: a.author || a.source.name,
            publishedAt: a.publishedAt,
          };
          const { category, score } = categorizeAndScore(article);
          return { ...article, category, score };
        });
        allArticles = [...allArticles, ...newsArticles];
      }
    } catch (err) {
      console.warn("⚠️ NewsAPI failed:", err.message);
    }

    // ========== 3. จัดเรียงและลบซ้ำ ==========
    const unique = allArticles.filter(
      (a, i, arr) => arr.findIndex((x) => x.url === a.url) === i
    );

    unique.sort(
      (a, b) =>
        b.score - a.score || new Date(b.publishedAt) - new Date(a.publishedAt)
    );

    const final = unique.slice(0, parseInt(limit));

    console.log(
      `📰 ${final.length} articles (Top 3: ${final
        .slice(0, 3)
        .map((a) => a.category.th)
        .join(", ")})`
    );

    res.json({ success: true, data: final, total: final.length });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ success: false, message: "ไม่สามารถดึงข่าวได้" });
  }
});

// Get categories
router.get("/categories", (req, res) => {
  res.json({
    success: true,
    data: [
      { id: "sign-language", name: "ภาษามือ", name_en: "Sign Language" },
      { id: "disability", name: "ผู้พิการ", name_en: "Disability" },
      { id: "accessibility", name: "การเข้าถึง", name_en: "Accessibility" },
      { id: "education", name: "การศึกษา", name_en: "Education" },
      { id: "healthcare", name: "สุขภาพ", name_en: "Healthcare" },
      { id: "technology", name: "เทคโนโลยี", name_en: "Technology" },
    ],
  });
});

// Get single article
router.get("/:id", (req, res) => {
  res.json({
    success: true,
    message: "Use the article URL to view full content",
  });
});

module.exports = router;
