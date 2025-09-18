// src/pages/Landing_page.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar_Handy from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { HeroSection } from "../components/sections/HeroSection";
import { SignIntroSection } from "../components/sections/SignIntroSection";
import { FeaturesSection } from "../components/sections/FeaturesSection";
import "./Landing_page.css";

export default function Landing_page() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar_Handy
        isLoggedIn={false}
        onLoginClick={() => navigate("/auth")}
        onRegisterClick={() => navigate("/auth")}
      />
      <main>
        <HeroSection />
        <SignIntroSection />
        <FeaturesSection />
      </main>
      <Footer />
    </>
  );
}
