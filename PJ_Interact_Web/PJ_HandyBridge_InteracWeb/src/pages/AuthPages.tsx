// src/pages/AuthPages.tsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Navbar_Handy from "../components/common/Navbar";
import "./AuthPages.css";

export default function Auth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // ดึง mode จาก URL
  const mode = searchParams.get("mode");

  // ถ้าไม่มี mode ให้ default เป็น login
  const [currentPage, setCurrentPage] = useState<"login" | "register">(
    mode === "register" ? "register" : "login"
  );

  // Login State
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register State
  const [registerData, setRegisterData] = useState({
    firstName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Update page เมื่อ URL parameter เปลี่ยน
  useEffect(() => {
    const newMode = searchParams.get("mode");
    if (newMode === "register") {
      setCurrentPage("register");
    } else if (newMode === "login") {
      setCurrentPage("login");
    } else {
      // ถ้าไม่มี mode ให้เซ็ตเป็น login และ update URL
      setCurrentPage("login");
      setSearchParams({ mode: "login" });
    }
  }, [searchParams, setSearchParams]);

  // Function เปลี่ยนหน้าพร้อม update URL
  const switchPage = (page: "login" | "register") => {
    setCurrentPage(page);
    setSearchParams({ mode: page });
  };

  // Form Handlers
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login:", loginData);
    // TODO: Supabase login
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      alert("รหัสผ่านไม่ตรงกัน");
      return;
    }
    console.log("Register:", registerData);
    // TODO: Supabase register
  };

  return (
    <div className="auth-page">
      <Navbar_Handy
        isLoggedIn={false}
        onLoginClick={() => switchPage("login")}
        onRegisterClick={() => switchPage("register")}
      />

      <div className={`auth-container ${currentPage}`}>
        <div className="auth-image">
          <img
            src={
              currentPage === "login"
                ? "/src/assets/images/login-hero.jpg"
                : "/src/assets/images/register-hero.jpg"
            }
            alt="Sign language learning"
          />
        </div>

        <div className="auth-form-container">
          <div className="auth-brand">
            <div className="auth-logo">
              <img src="/src/assets/logo/logo_handy1.png" alt="Handy Bridge" />
            </div>
            <h1>
              {currentPage === "login" ? "ลงชื่อเข้าใช้" : "สร้างบัญชีผู้ใช้"}
            </h1>
            <p>เรียนภาษามือฟรี สร้างสะพานสื่อสาร</p>
          </div>

          {currentPage === "login" ? (
            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <div className="form-field">
                <label>อีเมล*</label>
                <input
                  type="email"
                  name="email"
                  placeholder="เช่น john@email.com"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                />
              </div>

              <div className="form-field">
                <label>รหัสผ่าน*</label>
                <div className="password-container">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    name="password"
                    placeholder="รหัสผ่าน"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                  >
                    {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-button">
                เข้าสู่ระบบ
              </button>

              <div className="auth-link">
                ยังไม่มีบัญชี?{" "}
                <button type="button" onClick={() => switchPage("register")}>
                  สมัครสมาชิก
                </button>
              </div>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegisterSubmit}>
              <div className="form-field">
                <label>ชื่อ-สกุล*</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="ชื่อ-สกุล"
                  value={registerData.firstName}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="form-field">
                <label>อีเมล*</label>
                <input
                  type="email"
                  name="email"
                  placeholder="เช่น john@email.com"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="form-field">
                <label>รหัสผ่าน*</label>
                <div className="password-container">
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    name="password"
                    placeholder="รหัสผ่าน"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowRegisterPassword(!showRegisterPassword)
                    }
                  >
                    {showRegisterPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-field">
                <label>ยืนยันรหัสผ่าน*</label>
                <div className="password-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="ยืนยันรหัสผ่าน"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-button">
                สมัครสมาชิก
              </button>

              <div className="auth-link">
                มีบัญชีอยู่แล้ว?{" "}
                <button type="button" onClick={() => switchPage("login")}>
                  เข้าสู่ระบบ
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
