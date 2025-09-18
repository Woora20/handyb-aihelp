// src/pages/Auth.tsx
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Navbar_Handy from "../components/common/Navbar";
import "./AuthPages.css";

export default function Auth() {
  const [currentPage, setCurrentPage] = useState<"login" | "register">("login");

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

  // Simple Page Switch - ไม่มี animation
  const switchPage = (page: "login" | "register") => {
    setCurrentPage(page);
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
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      alert("รหัสผ่านไม่ตรงกัน");
      return;
    }
    console.log("Register:", registerData);
  };

  return (
    <div className="auth-page">
      <Navbar_Handy
        isLoggedIn={false}
        onLoginClick={() => switchPage("login")}
        onRegisterClick={() => switchPage("register")}
      />

      <div className={`auth-container ${currentPage}`}>
        {/* รูปภาพ - เปลี่ยนแค่ src และ border-radius */}
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

        {/* ฟอร์ม - เปลี่ยนแค่เนื้อหา */}
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

          {/* Login Form */}
          {currentPage === "login" && (
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
          )}

          {/* Register Form */}
          {currentPage === "register" && (
            <form className="auth-form" onSubmit={handleRegisterSubmit}>
              <div className="form-field">
                <label>ชื่อ-สกุล*</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="ชื่อ-สกุล*"
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
