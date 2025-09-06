import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
    agree: false,
  });

  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [touched, setTouched] = useState({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const usernameRegex = /^[a-zA-Z0-9_-]{4,16}$/;

  function passwordStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4); // 0~4
  }

  function validate(values) {
    const e = {};
    if (!values.username.trim()) e.username = "아이디를 입력하세요.";
    else if (!usernameRegex.test(values.username))
      e.username = "아이디는 4~16자의 영문/숫자/_/- 만 가능합니다.";

    if (!values.email.trim()) e.email = "이메일을 입력하세요.";
    else if (!emailRegex.test(values.email))
      e.email = "이메일 형식이 올바르지 않습니다.";

    if (!values.password) e.password = "비밀번호를 입력하세요.";
    else if (values.password.length < 8)
      e.password = "비밀번호는 8자 이상이어야 합니다.";

    if (!values.confirm) e.confirm = "비밀번호를 한 번 더 입력하세요.";
    else if (values.password !== values.confirm)
      e.confirm = "비밀번호가 일치하지 않습니다.";

    if (!values.agree) e.agree = "약관에 동의해야 가입할 수 있습니다.";

    return e;
  }

  const errors = validate(form);
  const isValid = Object.keys(errors).length === 0;
  const strength = passwordStrength(form.password);

  function handleChange(e) {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;
    // 프론트만: 저장/전송 안 함. 데모 로그만 남김.
    console.log("signup payload (frontend only):", {
      username: form.username,
      email: form.email,
    });
    navigate("/login");
  }

  return (
    <div className="page">
      <div className="signup-wrapper">
        <h1 className="signup-title">회원가입</h1>

        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <label className="label" htmlFor="username">아이디</label>
          <input
            id="username"
            name="username"
            className="input"
            type="text"
            placeholder="예: silversnack_user"
            value={form.username}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={touched.username && !!errors.username}
            aria-describedby={touched.username && errors.username ? "username-err" : undefined}
            autoComplete="username"
            required
          />
          {touched.username && errors.username && (
            <p id="username-err" className="error">{errors.username}</p>
          )}

          <label className="label" htmlFor="email">이메일</label>
          <input
            id="email"
            name="email"
            className="input"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={touched.email && !!errors.email}
            aria-describedby={touched.email && errors.email ? "email-err" : undefined}
            autoComplete="email"
            required
          />
          {touched.email && errors.email && (
            <p id="email-err" className="error">{errors.email}</p>
          )}

          <label className="label" htmlFor="password">비밀번호</label>
          <div className="password-wrap">
            <input
              id="password"
              name="password"
              className="input"
              type={showPw ? "text" : "password"}
              placeholder="8자 이상"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={touched.password && !!errors.password}
              aria-describedby={touched.password && errors.password ? "password-err" : undefined}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="ghost-btn"
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? "비밀번호 감추기" : "비밀번호 표시"}
            >
              {showPw ? "숨김" : "표시"}
            </button>
          </div>
          {touched.password && errors.password && (
            <p id="password-err" className="error">{errors.password}</p>
          )}

          {/* 비밀번호 강도 표시: 프론트 계산만 */}
          <div className={`pw-meter s-${strength}`} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <p className="pw-hint">
            {strength <= 1 ? "보안 취약" : strength === 2 ? "보통" : strength === 3 ? "좋음" : "매우 강함"}
          </p>

          <label className="label" htmlFor="confirm">비밀번호 확인</label>
          <div className="password-wrap">
            <input
              id="confirm"
              name="confirm"
              className="input"
              type={showPw2 ? "text" : "password"}
              placeholder="다시 입력"
              value={form.confirm}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={touched.confirm && !!errors.confirm}
              aria-describedby={touched.confirm && errors.confirm ? "confirm-err" : undefined}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="ghost-btn"
              onClick={() => setShowPw2((s) => !s)}
              aria-label={showPw2 ? "비밀번호 감추기" : "비밀번호 표시"}
            >
              {showPw2 ? "숨김" : "표시"}
            </button>
          </div>
          {touched.confirm && errors.confirm && (
            <p id="confirm-err" className="error">{errors.confirm}</p>
          )}

          <label className="agree">
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={touched.agree && !!errors.agree}
            />
            <span>
              이용약관 및 개인정보 처리방침에 동의합니다.
            </span>
          </label>
          {touched.agree && errors.agree && (
            <p className="error">{errors.agree}</p>
          )}

          <button className="submit-btn" type="submit" disabled={!isValid}>
            가입하기
          </button>

          <p className="foot">
            이미 계정이 있나요?{" "}
            <button type="button" className="text-btn" onClick={() => navigate("/login")}>
              로그인
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
