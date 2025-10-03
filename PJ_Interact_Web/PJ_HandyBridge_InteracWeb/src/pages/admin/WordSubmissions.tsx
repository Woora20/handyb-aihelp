// src/pages/admin/WordSubmissions.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

// 🔥 เพิ่ม Type definition
interface SubmittedWord {
  id: string;
  word_text: string;
  video_url?: string;
  description?: string;
  submitter_name: string;
  submitter_email: string;
  user_id?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

export default function WordSubmissions() {
  // 🔥 ระบุ Type
  const [submissions, setSubmissions] = useState<SubmittedWord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from("submitted_words")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setSubmissions(data as SubmittedWord[]);
      }
    } catch (err) {
      console.error("Error loading submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("submitted_words")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (!error) {
        loadSubmissions();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-submissions">
      <h1>คำศัพท์ที่ส่งเข้ามา</h1>
      <div className="submissions-list">
        {submissions.map((sub) => (
          <div key={sub.id} className="submission-card">
            <h3>{sub.word_text}</h3>
            <p>โดย: {sub.submitter_name}</p>
            <p>อีเมล: {sub.submitter_email}</p>
            <p>สถานะ: {sub.status}</p>
            <p>
              ส่งเมื่อ: {new Date(sub.created_at).toLocaleDateString("th-TH")}
            </p>

            {sub.description && <p>คำอธิบาย: {sub.description}</p>}

            {sub.video_url && (
              <a href={sub.video_url} target="_blank" rel="noopener noreferrer">
                ดูวิดีโอ
              </a>
            )}

            {sub.status === "pending" && (
              <div className="action-buttons">
                <button
                  onClick={() => updateStatus(sub.id, "approved")}
                  className="approve-btn"
                >
                  อนุมัติ
                </button>
                <button
                  onClick={() => updateStatus(sub.id, "rejected")}
                  className="reject-btn"
                >
                  ปฏิเสธ
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
