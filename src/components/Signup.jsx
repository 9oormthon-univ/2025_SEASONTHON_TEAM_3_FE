import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();

  const HEALTH_CONCERNS = [
    { value: "BLOOD_SUGAR",    label: "혈당" },
    { value: "BLOOD_PRESSURE", label: "고혈압" },
    { value: "CHOLESTEROL",    label: "콜레스테롤" },
    { value: "WEIGHT_CONTROL", label: "체중 관리" },
    { value: "KIDNEY",         label: "신장" },
    { value: "HEART",          label: "심혈관" },
  ];

  const ALLERGIES = [
    { value: "MILK",      label: "우유" },
    { value: "EGG",       label: "계란" },
    { value: "WHEAT",     label: "밀" },
    { value: "SOY",       label: "대두" },
    { value: "PEANUT",    label: "땅콩" },
    { value: "TREE_NUT",  label: "견과류" },
    { value: "FISH",      label: "생선" },
    { value: "SHELLFISH", label: "조개/갑각류" },
    { value: "SESAME",    label: "참깨" },
    { value: "BUCKWHEAT", label: "메밀" },
  ];

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
    agree: false,
    healthConcerns: [],
    allergies: [],
  });

  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [touched, setTouched] = useState({});

  // ✅ 이메일 검사 복구
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

  function validate(values) {
    const e = {};
    if (!values.username.trim()) e.username = "이름을 입력하세요.";

    if (!values.email.trim()) e.email = "이메일을 입력하세요.";
    else if (!emailRegex.test(values.email))
      e.email = "이메일 형식이 올바르지 않습니다.";

    if (!values.password) e.password = "비밀번호를 입력하세요.";
    else if (values.password.length < 5)
      e.password = "비밀번호는 5자 이상이어야 합니다.";

    if (!values.confirm) e.confirm = "비밀번호를 한 번 더 입력하세요.";
    else if (values.password !== values.confirm)
      e.confirm = "비밀번호가 일치하지 않습니다.";

    if (!values.agree) e.agree = "약관에 동의해야 가입할 수 있습니다.";

    return e;
  }

  const errors = validate(form);
  const isValid = Object.keys(errors).length === 0;

  function handleChange(e) {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  // ✅ 칩 토글 공용 핸들러
  const toggleChip = (field, val) => {
    setForm((prev) => {
      const selected = prev[field];
      const has = selected.includes(val);
      const next = has ? selected.filter((v) => v !== val) : [...selected, val];
      return { ...prev, [field]: next };
    });
  };
  const clearChips = (field) => {
    setForm((prev) => ({ ...prev, [field]: [] }));
  };

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;

    // ✅ MyPage에서 읽을 수 있도록 저장
    localStorage.setItem("healthConcerns", JSON.stringify(form.healthConcerns));
    localStorage.setItem("allergies", JSON.stringify(form.allergies));

    // ✅ 로그인 화면 연동을 위한 이름/이메일 저장
    localStorage.setItem("signup_username", form.username);
    localStorage.setItem("signup_email", form.email);

    console.log("signup payload:", {
      username: form.username,
      email: form.email,
      healthConcerns: form.healthConcerns,
      allergies: form.allergies,
    });

    navigate("/login");
  }

  return (
    <div className="page">
      <div className="signup-wrapper">
        <h1 className="signup-title">회원가입</h1>

        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          {/* 이름 */}
          <label className="label" htmlFor="username">이름</label>
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

          {/* 이메일 */}
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

          {/* 비밀번호 */}
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
            >
              {showPw ? "숨김" : "표시"}
            </button>
          </div>
          {touched.password && errors.password && (
            <p id="password-err" className="error">{errors.password}</p>
          )}

          {/* 비밀번호 확인 */}
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
            >
              {showPw2 ? "숨김" : "표시"}
            </button>
          </div>
          {touched.confirm && errors.confirm && (
            <p id="confirm-err" className="error">{errors.confirm}</p>
          )}

          {/* 건강상태 체크 */}
          <div className="hc-section">
            <div className="hc-head">
              <label className="label">건강상태 체크</label>
              <p className="hc-subtitle">건강 우려/목적을 선택하세요. (다중 선택)</p>
            </div>
            <div className="hc-chip-row">
              {HEALTH_CONCERNS.map(({ value, label }) => {
                const active = form.healthConcerns.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    className={`hc-chip ${active ? "is-active" : ""}`}
                    onClick={() => toggleChip("healthConcerns", value)}
                  >
                    <span className="hc-dot" />
                    <span>{label}</span>
                  </button>
                );
              })}
              <button
                type="button"
                className={`hc-chip hc-none ${form.healthConcerns.length === 0 ? "is-active" : ""}`}
                onClick={() => clearChips("healthConcerns")}
              >
                없음
              </button>
            </div>
          </div>

          {/* 알레르기 체크 */}
          <div>
            <div>
              <label className="label">알레르기 체크</label>
              <p className="hc-subtitle">가지고 계신 알레르기를 선택하세요. (다중 선택)</p>
            </div>
            <div className="hc-chip-row">
              {ALLERGIES.map(({ value, label }) => {
                const active = form.allergies.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    className={`hc-chip ${active ? "is-active" : ""}`}
                    onClick={() => toggleChip("allergies", value)}
                  >
                    <span className="hc-dot" />
                    <span>{label}</span>
                  </button>
                );
              })}
              <button
                type="button"
                className={`hc-chip hc-none ${form.allergies.length === 0 ? "is-active" : ""}`}
                onClick={() => clearChips("allergies")}
              >
                없음
              </button>
            </div>
          </div>

          {/* 약관 */}
          <label className="agree">
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <span>이용약관 및 개인정보 처리방침에 동의합니다.</span>
          </label>
          {touched.agree && errors.agree && (
            <p className="error">{errors.agree}</p>
          )}

          {/* 제출 버튼 */}
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
