// src/Login.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  // ✅ API 엔드포인트 (.env 없으면 서버 기본 URL 사용)
  const DEFAULT_API_BASE = "http://3.35.209.210:8080";
  const API_BASE = import.meta.env.VITE_API_BASE || DEFAULT_API_BASE;
  // Swagger의 정확한 경로/대소문자와 동일해야 함: /user/logIn
  const LOGIN_URL = `${API_BASE}/user/logIn`;

  // 폼 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // UI 상태
  const [submitting, setSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState("");

  // 회원가입에서 저장해둔 이메일 자동 채움
  useEffect(() => {
    const saved = localStorage.getItem("signup_email");
    if (saved) setEmail(saved);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setServerMsg("");

    try {
      const res = await fetch(LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // 응답이 비어있을 수도 있으니 먼저 text로 받고 JSON 파싱 시도
      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch {}

      // 서버 스펙: 200 이고 data.success !== false 이어야 성공으로 간주
      const ok = res.ok && (data?.success !== false);
      if (!ok) {
        const msg =
          data?.message ||
          data?.errorCode ||
          (res.status === 401 ? "이메일 또는 비밀번호가 올바르지 않습니다." :
           res.status >= 500 ? "서버 오류가 발생했습니다." :
           `요청이 거절되었습니다. (HTTP ${res.status})`);
        setServerMsg(msg);
        setSubmitting(false);
        return;
      }

      // ✅ 토큰 저장
      const { accessToken, refreshToken } = data?.result || {};
      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("login_email", email);
      localStorage.setItem("is_authenticated", "true");
      localStorage.setItem("login_at", new Date().toISOString());

      // 홈으로 이동
      navigate("/");
    } catch (err) {
      console.error("[LOGIN] network error:", err);
      setServerMsg("네트워크/CORS 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="wrapper">
        <h1 className="login-title">로그인</h1>

        <form className="login-form" onSubmit={handleSubmit} noValidate aria-busy={submitting}>
          <input
            type="email"
            className="login-input"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <div style={{ position: "relative" }}>
            <input
              type={showPw ? "text" : "password"}
              className="login-input"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="text-btn"
              style={{ position: "absolute", right: 8, top: 8 }}
              aria-label={showPw ? "비밀번호 감추기" : "비밀번호 표시"}
            >
              {showPw ? "숨김" : "표시"}
            </button>
          </div>

          {serverMsg && (
            <p className="error" role="alert" style={{ marginTop: 6 }}>
              {serverMsg}
            </p>
          )}

          <button type="submit" className="login-btn" disabled={submitting || !email || !password}>
            {submitting ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <button className="signup-btn" onClick={() => navigate("/signup")}>
          회원가입
        </button>
      </div>
    </div>
  );
}

export default Login;
