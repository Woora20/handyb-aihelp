// src/pages/AuthPages.tsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Navbar_Handy from "../components/common/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import "./AuthPages.css";

// Validation functions
const validateFullName = (name: string): string | null => {
  const trimmed = name.trim();
  const parts = trimmed.split(" ").filter(Boolean);

  if (parts.length < 2) return "กรุณาใส่ชื่อและนามสกุล (คั่นด้วยช่องว่าง)";
  if (parts.some((part) => part.length < 2))
    return "ชื่อและนามสกุลต้องมีอย่างน้อย 2 ตัวอักษร";
  if (trimmed.length > 100) return "ชื่อ-นามสกุลยาวเกินไป";
  return null;
};

const validateEmail = (email: string): string | null => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? null
    : "รูปแบบอีเมลไม่ถูกต้อง";
};

const validatePassword = (password: string): string | null => {
  return password.length < 6 ? "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" : null;
};

export default function Auth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp, signIn, user } = useAuth();

  const [currentPage, setCurrentPage] = useState<"login" | "register">(
    searchParams.get("mode") === "register" ? "register" : "login"
  );

  const [formData, setFormData] = useState({
    login: { email: "", password: "" },
    register: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    login: false,
    register: false,
    confirm: false,
  });

  // Redirect if logged in
  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  // Sync URL with page
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode !== currentPage) {
      setSearchParams({ mode: currentPage });
    }
  }, [currentPage, searchParams, setSearchParams]);

  const switchPage = (page: "login" | "register") => {
    setCurrentPage(page);
    setErrors({});
  };

  const handleInputChange = (
    form: "login" | "register",
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [form]: { ...prev[form], [field]: value },
    }));
    // Clear specific error
    setErrors((prev: any) => ({ ...prev, [field]: "" }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password } = formData.login;

    // Validate
    const emailError = !email ? "กรุณากรอกอีเมล" : validateEmail(email);
    const passwordError = !password ? "กรุณากรอกรหัสผ่าน" : null;

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const { error } = await signIn(email, password);

      if (error) {
        const message = error.message.includes("Invalid login credentials")
          ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
          : error.message.includes("Email not confirmed")
          ? "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ"
          : "เกิดข้อผิดพลาด กรุณาลองใหม่";

        setErrors({ general: message });
      }
    } catch {
      setErrors({ general: "เกิดข้อผิดพลาดในการเชื่อมต่อ" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { fullName, email, password, confirmPassword } = formData.register;

    // Validate all fields
    const validationErrors: any = {};

    const fullNameError = validateFullName(fullName);
    if (fullNameError) validationErrors.fullName = fullNameError;

    const emailError = validateEmail(email);
    if (emailError) validationErrors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) validationErrors.password = passwordError;

    if (password !== confirmPassword) {
      validationErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Check if email exists using RPC function
      const { data: emailExists } = await supabase.rpc("check_email_exists", {
        check_email: email,
      });

      if (emailExists) {
        setErrors({ email: "อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น" });
        setIsLoading(false);
        return;
      }

      // Register new user
      const { error } = await signUp(email, password, fullName.trim());

      if (error) {
        if (error.message.includes("already")) {
          setErrors({ email: "อีเมลนี้ถูกใช้งานแล้ว" });
        } else {
          setErrors({ general: error.message });
        }
      } else {
        // Auto login after successful registration
        alert("สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบ...");
        await signIn(email, password);
        navigate("/");
      }
    } catch {
      setErrors({ general: "เกิดข้อผิดพลาดในการเชื่อมต่อ" });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordInput = (
    type: "login" | "register" | "confirm",
    value: string,
    onChange: (value: string) => void,
    placeholder: string = "รหัสผ่าน"
  ) => (
    <div className="password-container">
      <input
        type={
          showPassword[type as keyof typeof showPassword] ? "text" : "password"
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={isLoading}
        required
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() =>
          setShowPassword((prev) => ({
            ...prev,
            [type]: !prev[type as keyof typeof showPassword],
          }))
        }
        disabled={isLoading}
      >
        {showPassword[type as keyof typeof showPassword] ? (
          <FaEyeSlash />
        ) : (
          <FaEye />
        )}
      </button>
    </div>
  );

  return (
    <div className="auth-page">
      <Navbar_Handy
        onLoginClick={() => switchPage("login")}
        onRegisterClick={() => switchPage("register")}
      />

      <div className={`auth-container ${currentPage}`}>
        <div className="auth-image">
          <img
            src={`/src/assets/images/${currentPage}-hero.jpg`}
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
            <form className="auth-form" onSubmit={handleLogin}>
              {errors.general && (
                <div className="error-message general">{errors.general}</div>
              )}

              <div className="form-field">
                <label>อีเมล*</label>
                <input
                  type="email"
                  value={formData.login.email}
                  onChange={(e) =>
                    handleInputChange("login", "email", e.target.value)
                  }
                  placeholder="เช่น john@email.com"
                  className={errors.email ? "error" : ""}
                  disabled={isLoading}
                  required
                />
                {errors.email && (
                  <span className="error-text">{errors.email}</span>
                )}
              </div>

              <div className="form-field">
                <label>รหัสผ่าน*</label>
                {renderPasswordInput(
                  "login",
                  formData.login.password,
                  (value) => handleInputChange("login", "password", value)
                )}
                {errors.password && (
                  <span className="error-text">{errors.password}</span>
                )}
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={isLoading}
              >
                {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>

              <div className="auth-link">
                ยังไม่มีบัญชี?{" "}
                <button type="button" onClick={() => switchPage("register")}>
                  สมัครสมาชิก
                </button>
              </div>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegister}>
              {errors.general && (
                <div className="error-message general">{errors.general}</div>
              )}

              <div className="form-field">
                <label>ชื่อ-นามสกุล* (คั่นด้วยช่องว่าง)</label>
                <input
                  type="text"
                  value={formData.register.fullName}
                  onChange={(e) =>
                    handleInputChange("register", "fullName", e.target.value)
                  }
                  placeholder="ตัวอย่าง: สมชาย ใจดี"
                  className={errors.fullName ? "error" : ""}
                  disabled={isLoading}
                  required
                />
                {errors.fullName && (
                  <span className="error-text">{errors.fullName}</span>
                )}
              </div>

              <div className="form-field">
                <label>อีเมล*</label>
                <input
                  type="email"
                  value={formData.register.email}
                  onChange={(e) =>
                    handleInputChange("register", "email", e.target.value)
                  }
                  placeholder="เช่น john@email.com"
                  className={errors.email ? "error" : ""}
                  disabled={isLoading}
                  required
                />
                {errors.email && (
                  <span className="error-text">{errors.email}</span>
                )}
              </div>

              <div className="form-field">
                <label>รหัสผ่าน* (ขั้นต่ำ 6 ตัวอักษร)</label>
                {renderPasswordInput(
                  "register",
                  formData.register.password,
                  (value) => handleInputChange("register", "password", value)
                )}
                {errors.password && (
                  <span className="error-text">{errors.password}</span>
                )}
              </div>

              <div className="form-field">
                <label>ยืนยันรหัสผ่าน*</label>
                {renderPasswordInput(
                  "confirm",
                  formData.register.confirmPassword,
                  (value) =>
                    handleInputChange("register", "confirmPassword", value),
                  "ยืนยันรหัสผ่าน"
                )}
                {errors.confirmPassword && (
                  <span className="error-text">{errors.confirmPassword}</span>
                )}
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={isLoading}
              >
                {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
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

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
}
