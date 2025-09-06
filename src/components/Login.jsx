import React from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 인증 로직
    navigate("/");
  };

  return (
    <div className="page">
      <div className="wrapper">
        <h1 className="login-title">로그인</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="login-input"
            placeholder="아이디"
            autoComplete="username"
            required
          />
          <input
            type="password"
            className="login-input"
            placeholder="비밀번호"
            autoComplete="current-password"
            required
          />
          <button type="submit" className="login-btn">로그인</button>
        </form>
        <button className="signup-btn" onClick={() => navigate("/signup")}>회원가입</button>
      </div>
    </div>
  );
}

export default Login;
