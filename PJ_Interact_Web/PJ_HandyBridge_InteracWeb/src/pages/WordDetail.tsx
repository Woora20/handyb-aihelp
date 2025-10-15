// src/pages/WordDetail.tsx - ปรับปรุงใหม่
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FiPlay,
  FiPause,
  FiShare2,
  FiBookmark,
  FiEye,
  FiChevronRight,
  FiAlertCircle,
} from "react-icons/fi";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import "./WordDetail.css";

// Mock Data Type
interface WordData {
  id: string;
  word: string;
  category: string;
  videoUrl: string;
  description: string;
  wordType: string;
  organization: string;
  reference: string;
  productionDate: string;
  createdAt: string;
  submitter: string;
  views: number;
  relatedWords: RelatedWord[];
}

interface RelatedWord {
  id: string;
  word: string;
  category: string;
  thumbnailUrl?: string;
}

// Mock Data
const MOCK_WORD_DATA: { [key: string]: WordData } = {
  "1": {
    id: "1",
    word: "สวัสดี: ท่ามือนี้ใช้กับผู้ใหญ่ ผู้มีอาวุโส ผู้มีตำแหน่งสูง",
    category: "การทักทาย",
    videoUrl: "/videos/sawasdee.mp4",
    description:
      "คำทักทายพื้นฐานที่ใช้ทุกวัน สามารถใช้ได้ทั้งตอนเช้า กลางวัน และเย็น เหมาะสำหรับการทักทายทั่วไป",
    wordType: "คำกริยา",
    organization: "สมาคมคนหูหนวกแห่งประเทศไทย",
    reference: "พจนานุกรมภาษามือไทย ฉบับปรับปรุง พ.ศ. 2565",
    productionDate: "15 สิงหาคม 2565",
    createdAt: "10 ตุลาคม 2567",
    submitter: "ทีมงาน Handy Bridge",
    views: 266,
    relatedWords: [
      { id: "2", word: "สวัสดี: ท่ามือนี้ใช้กันเพื่อน", category: "การทักทาย" },
      {
        id: "3",
        word: "สวัสดี: ท่ามือนี้ใช้กับผู้ใหญ่",
        category: "การทักทาย",
      },
      { id: "4", word: "ขอบคุณ", category: "การทักทาย" },
      { id: "5", word: "ขอโทษ", category: "การทักทาย" },
    ],
  },
};

export default function WordDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [wordData, setWordData] = useState<WordData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      if (id && MOCK_WORD_DATA[id]) {
        setWordData(MOCK_WORD_DATA[id]);
      }
      setIsLoading(false);
    }, 500);
  }, [id]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement video play/pause
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
        console.log("Share cancelled");
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("คัดลอกลิงก์แล้ว!");
    }
  };

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

  if (!wordData) {
    return (
      <div className="word-detail-page">
        <Navbar />
        <main className="word-detail-main">
          <div className="error-container">
            <FiAlertCircle className="error-icon" />
            <p className="error-text">ไม่พบคำศัพท์ที่คุณค้นหา</p>
            <button className="back-button" onClick={() => navigate("/search")}>
              กลับไปค้นหา
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
            to={`/search?category=${encodeURIComponent(wordData.category)}`}
            className="breadcrumb-link"
          >
            {wordData.category}
          </Link>
          <FiChevronRight className="breadcrumb-separator" />
          <span className="breadcrumb-current">{wordData.word}</span>
        </div>

        <div className="word-detail-container">
          {/* Left Column - Main Content */}
          <div className="word-main-section">
            {/* Video Player */}
            <div className="word-video-container">
              <video className="word-video" poster="/video-placeholder.jpg">
                <source src={wordData.videoUrl} type="video/mp4" />
                เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
              </video>

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
            </div>

            {/* Word Info */}
            <div className="word-info">
              <div className="word-header">
                <div className="word-title-section">
                  {/* แสดงแค่ views โดยไม่มี icon */}
                  <div className="word-views">
                    <span>{wordData.views.toLocaleString()} views</span>
                  </div>
                </div>

                {/* เหลือแค่ปุ่ม Save และ Share */}
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

              {/* Description - ข้อมูลแบบบรรทัด */}
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
                  <span className="description-value">{wordData.category}</span>
                </div>

                <div className="description-item">
                  <span className="description-label">ชนิดของคำ:</span>
                  <span className="description-value">{wordData.wordType}</span>
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
                    {wordData.productionDate}
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
                    {wordData.createdAt}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Related Words */}
          <aside className="word-sidebar">
            <div className="related-section">
              <h2 className="related-title">หมวดหมู่: {wordData.category}</h2>
              <div className="related-words-list">
                {wordData.relatedWords.map((relatedWord) => (
                  <Link
                    key={relatedWord.id}
                    to={`/word/${relatedWord.id}`}
                    className="related-word-item"
                  >
                    <div className="related-thumbnail">
                      {relatedWord.thumbnailUrl && (
                        <img
                          src={relatedWord.thumbnailUrl}
                          alt={relatedWord.word}
                        />
                      )}
                    </div>
                    <div className="related-info">
                      <p className="related-word-text">{relatedWord.word}</p>
                      <p className="related-category">{relatedWord.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
