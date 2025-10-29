// src/pages/News.tsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { newsService } from "../services/newsService";
import type { NewsArticle } from "../types/news.types";
import "./News.css";

export default function News() {
  const [featuredNews, setFeaturedNews] = useState<NewsArticle | null>(null);
  const [newsList, setNewsList] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      try {
        const articles = await newsService.getNews({ limit: 20 });

        if (articles.length > 0) {
          setFeaturedNews(articles[0]);
          setNewsList(articles.slice(1, 11));
        } else {
          setError("ไม่พบข่าวที่เกี่ยวข้อง");
        }
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("ไม่สามารถโหลดข่าวได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleNewsClick = (url: string) => {
    window.open(url, "_blank");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="news-page">
        <Navbar />
        <main className="news-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>กำลังโหลดข่าว...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-page">
        <Navbar />
        <main className="news-main">
          <div className="error-container">
            <p>{error}</p>
            <p style={{ fontSize: "14px", marginTop: "8px", color: "#9ca3af" }}>
              ลองรีเฟรชหน้าใหม่อีกครั้ง
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="news-page">
      <Navbar />

      <main className="news-main">
        <h1 className="news-title">ข่าวใหม่น่าสนใจ</h1>

        <div className="news-container">
          {/* Featured News - ซ้าย */}
          {featuredNews && (
            <div
              className="featured-news"
              onClick={() => handleNewsClick(featuredNews.url)}
            >
              <div
                className="featured-image"
                style={{
                  backgroundImage: `url(${
                    featuredNews.imageUrl || "/placeholder-news.jpg"
                  })`,
                }}
              >
                <div className="featured-overlay">
                  {/* ⬇️ แสดง category จริงของข่าว */}
                  <span className="featured-category">
                    {featuredNews.category?.th || "ทั่วไป"}
                  </span>
                  <h2 className="featured-title">{featuredNews.title}</h2>
                  <div className="featured-meta">
                    <span>โดย {featuredNews.source}</span>
                    <span className="meta-divider">•</span>
                    <span>{formatDate(featuredNews.publishedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* News List - ขวา */}
          <div className="news-list">
            {newsList.length > 0 ? (
              newsList.map((news, index) => (
                <div
                  key={index}
                  className="news-item"
                  onClick={() => handleNewsClick(news.url)}
                >
                  <div
                    className="news-item-image"
                    style={{
                      backgroundImage: `url(${
                        news.imageUrl || "/placeholder-news.jpg"
                      })`,
                    }}
                  ></div>
                  <div className="news-item-content">
                    {/* ⬇️ แสดง category จริงของข่าว */}
                    <span className="news-item-category">
                      {news.category?.th || "ทั่วไป"}
                    </span>
                    <h3 className="news-item-title">{news.title}</h3>
                    <div className="news-item-meta">
                      <span>โดย {news.source}</span>
                      <span className="meta-divider">•</span>
                      <span>{formatDate(news.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#9ca3af",
                }}
              >
                <p>ไม่มีข่าวเพิ่มเติม</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
