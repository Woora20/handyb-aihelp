// src/pages/WordDetail.tsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FiPlay,
  FiPause,
  FiShare2,
  FiBookmark,
  FiChevronRight,
  FiAlertCircle,
} from "react-icons/fi";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { wordService } from "../services/wordService";
import { viewTracker } from "../utils/viewTracker";
import type { Word, RelatedWord } from "../types/word.types";
import "./WordDetail.css";

export default function WordDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [wordData, setWordData] = useState<Word | null>(null);
  const [relatedWords, setRelatedWords] = useState<RelatedWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 เช็คว่า URL เป็น GIF หรือไม่
  const isGif = (url: string | undefined): boolean => {
    if (!url) return false;
    return (
      url.toLowerCase().endsWith(".gif") ||
      url.toLowerCase().includes(".gif?") ||
      url.includes("giphy.com") ||
      url.includes("tenor.com")
    );
  };

  // โหลดข้อมูล
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("ไม่พบ ID ของคำศัพท์");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log("Fetching word with ID:", id); // 🔥 Debug

        const word = await wordService.getWordById(id);

        if (!word) {
          setError("ไม่พบคำศัพท์ที่คุณค้นหา");
          setIsLoading(false);
          return;
        }

        console.log("Word data:", word); // 🔥 Debug
        console.log("Video URL:", word.video_url); // 🔥 Debug
        console.log("Is GIF:", isGif(word.video_url)); // 🔥 Debug

        setWordData(word);

        const related = await wordService.getRelatedWords(id);
        setRelatedWords(related);
      } catch (err) {
        console.error("Error fetching word detail:", err);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ติดตาม views
  useEffect(() => {
    if (!id || !wordData) return;

    viewTracker.startTracking(id, async () => {
      console.log("View threshold reached! Recording view...");
      const success = await wordService.incrementView(id);

      if (success && wordData) {
        setWordData({
          ...wordData,
          views: wordData.views + 1,
        });
      }
    });

    return () => {
      viewTracker.stopTracking(id);
    };
  }, [id, wordData]);

  // 🔥 จัดการ Play/Pause สำหรับวิดีโอ (ไม่รวม GIF)
  const handlePlayPause = () => {
    if (!videoRef.current || isGif(wordData?.video_url)) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `ภาษามือ: ${wordData?.word}`,
          text: `เรียนรู้ภาษามือคำว่า "${wordData?.word}" กับ Handy Bridge`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled or failed");
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("คัดลอกลิงก์แล้ว!");
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="word-detail-page">
        <Navbar />
        <main className="word-detail-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">กำลังโหลด...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !wordData) {
    return (
      <div className="word-detail-page">
        <Navbar />
        <main className="word-detail-main">
          <div className="error-container">
            <FiAlertCircle className="error-icon" />
            <p className="error-text">{error || "ไม่พบคำศัพท์ที่คุณค้นหา"}</p>
            <button className="back-button" onClick={() => navigate("/search")}>
              กลับไปค้นหา
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 🔥 ตรวจสอบว่ามีวิดีโอ/GIF หรือไม่
  const hasMedia = wordData.video_url && wordData.video_url.trim() !== "";
  const mediaIsGif = isGif(wordData.video_url);

  return (
    <div className="word-detail-page">
      <Navbar />

      <main className="word-detail-main">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/" className="breadcrumb-link">
            หน้าหลัก
          </Link>
          <FiChevronRight className="breadcrumb-separator" />
          <Link to="/search" className="breadcrumb-link">
            ค้นหา
          </Link>
          <FiChevronRight className="breadcrumb-separator" />
          <Link
            to={`/search?category=${wordData.category?.name || ""}`}
            className="breadcrumb-link"
          >
            {wordData.category?.name || "ไม่ระบุหมวดหมู่"}
          </Link>
          <FiChevronRight className="breadcrumb-separator" />
          <span className="breadcrumb-current">{wordData.word}</span>
        </div>

        <div className="word-detail-container">
          {/* Left Column - Main Content */}
          <div className="word-main-section">
            {/* 🔥 Video/GIF Player */}
            <div className="word-video-container">
              {!hasMedia ? (
                // ไม่มีวิดีโอ/GIF
                <div className="no-video-placeholder">
                  <p>ยังไม่มีวิดีโอสำหรับคำนี้</p>
                </div>
              ) : mediaIsGif ? (
                // แสดง GIF
                <img
                  src={wordData.video_url}
                  alt={wordData.word}
                  className="word-video gif-image"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                // แสดงวิดีโอ
                <>
                  <video
                    ref={videoRef}
                    className="word-video"
                    poster={wordData.thumbnail_url || undefined}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  >
                    <source src={wordData.video_url} type="video/mp4" />
                    เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
                  </video>

                  {/* Video Controls */}
                  <div className="video-controls">
                    <button
                      className="play-btn"
                      onClick={handlePlayPause}
                      aria-label={isPlaying ? "หยุดเล่น" : "เล่นวิดีโอ"}
                    >
                      {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
                    </button>
                    <div className="video-progress">
                      <div className="video-progress-bar"></div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Word Info */}
            <div className="word-info">
              <div className="word-header">
                <div className="word-title-section">
                  <div className="word-views">
                    <span>{wordData.views.toLocaleString()} views</span>
                  </div>
                </div>

                <div className="word-actions">
                  <button
                    className={`action-btn ${isSaved ? "active" : ""}`}
                    onClick={() => setIsSaved(!isSaved)}
                    aria-label="บันทึก"
                  >
                    <FiBookmark
                      size={20}
                      fill={isSaved ? "currentColor" : "none"}
                    />
                  </button>
                  <button
                    className="action-btn"
                    onClick={handleShare}
                    aria-label="แชร์"
                  >
                    <FiShare2 size={20} />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="word-description">
                <div className="description-item">
                  <span className="description-label">ชื่อคำศัพท์:</span>
                  <span className="description-value">{wordData.word}</span>
                </div>

                <div className="description-item">
                  <span className="description-label">ความหมาย:</span>
                  <span className="description-value">
                    {wordData.description}
                  </span>
                </div>

                <div className="description-item">
                  <span className="description-label">หมวดหมู่:</span>
                  <span className="description-value">
                    {wordData.category?.name || "ไม่ระบุ"}
                  </span>
                </div>

                <div className="description-item">
                  <span className="description-label">ชนิดของคำ:</span>
                  <span className="description-value">
                    {wordData.word_type}
                  </span>
                </div>

                <div className="description-item">
                  <span className="description-label">ชื่อหน่วยงานที่ทำ:</span>
                  <span className="description-value">
                    {wordData.organization}
                  </span>
                </div>

                <div className="description-item">
                  <span className="description-label">
                    แหล่งอ้างอิงภาษามือ:
                  </span>
                  <span className="description-value">
                    {wordData.reference}
                  </span>
                </div>

                <div className="description-item">
                  <span className="description-label">วันที่ผลิต:</span>
                  <span className="description-value">
                    {wordData.production_date}
                  </span>
                </div>

                <div className="description-item">
                  <span className="description-label">อัพโหลดโดย:</span>
                  <span className="description-value">
                    {wordData.submitter}
                  </span>
                </div>

                <div className="description-item">
                  <span className="description-label">วันที่อัพโหลด:</span>
                  <span className="description-value">
                    {new Date(wordData.created_at).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Related Words */}
          <aside className="word-sidebar">
            <div className="related-section">
              <h2 className="related-title">
                หมวดหมู่: {wordData.category?.name || "ไม่ระบุ"}
              </h2>
              <div className="related-words-list">
                {relatedWords.length > 0 ? (
                  relatedWords.map((relatedWord) => (
                    <Link
                      key={relatedWord.id}
                      to={`/word/${relatedWord.id}`}
                      className="related-word-item"
                    >
                      <div className="related-thumbnail">
                        {relatedWord.thumbnail_url && (
                          <img
                            src={relatedWord.thumbnail_url}
                            alt={relatedWord.word}
                          />
                        )}
                      </div>
                      <div className="related-info">
                        <p className="related-word-text">{relatedWord.word}</p>
                        <p className="related-category">
                          {relatedWord.category}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p
                    style={{
                      color: "#9ca3af",
                      fontSize: "14px",
                      padding: "20px 0",
                    }}
                  >
                    ไม่มีคำศัพท์ที่เกี่ยวข้อง
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
