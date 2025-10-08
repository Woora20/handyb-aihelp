// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import "./index.css";
// import "./src/test-gemini";
import Landing_page from "./pages/Landing_page";
import Auth from "./pages/AuthPages";
import AIChatbot from "./pages/AIChatbot";
import SubmitWord from "./pages/SubmitWord";
import Review from "./pages/Review";
import Search from "./pages/Search";
import WordDetail from "./pages/WordDetail";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing_page />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/ai-assistant" element={<AIChatbot />} />
          <Route path="/submit-word" element={<SubmitWord />} />
          <Route path="/review" element={<Review />} />
          <Route path="/search" element={<Search />} />
          <Route path="/word/:id" element={<WordDetail />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
