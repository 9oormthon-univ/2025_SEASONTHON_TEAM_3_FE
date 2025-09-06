import React from "react";
import "./Header.css"; 
import { useNavigate } from "react-router-dom";

function Header() {
    const navigate = useNavigate();
  return (
    <header className="header">
      <img src="silver-snack.png" className="logo" alt="Silver Snack" onClick={() => navigate("/")} />
      <nav className="nav-list">
        <ul className="nav-list a">
          <li><a href="/find">간식찾기</a></li>
          <li><a href="/about">서비스소개</a></li>
          <li><a href="/mypage">마이페이지</a></li>
        </ul>
      </nav>
      <button className="login-btn" onClick={() => navigate("/login")}>로그인</button>
    </header>
  );
}

export default Header;
