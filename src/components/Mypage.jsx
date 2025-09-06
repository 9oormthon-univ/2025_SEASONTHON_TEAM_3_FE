import React, { useState } from "react";
import "./MyPage.css";
import { useFavorites } from "./FavoritesContext";
import { useNavigate } from "react-router-dom";

export default function MyPage() {
  const navigate = useNavigate();
  const { favorites, remove } = useFavorites();
  const [tab, setTab] = useState("profile"); // 'profile' | 'favs'

  return (
    <div className="mypage">
      {/* 사이드바 */}
      <aside className="mp-sidebar">
        <div className="mp-user">
          <img className="mp-avatar" src="/images/avatar.png" alt="user" />
          <div>
            <strong className="mp-name">김민지</strong>
          </div>
        </div>
        <nav className="mp-nav">
          <button
              className={`mp-nav-item ${tab === "favs" ? "active" : ""}`}
              onClick={() => setTab("favs")}

            >
              찜한 간식
          </button>
          <button
              className={`mp-nav-item ${tab === "profile" ? "active" : ""}`}
              onClick={() => setTab("profile")}
            >
              회원 정보 수정
            </button>
        </nav>
      </aside>

      {/* 본문 */}
      <main className="mp-content">
        <header className="mp-header">
          <h1>내 실버푸드</h1>
        </header>

        {tab === "profile" && (
          <section className="mp-card">
            <form className="mp-form">
              <div className="field">
                <label>이름</label>
                <input type="text" defaultValue="김민지" />
              </div>
              <div className="field">
                <label>이메일</label>
                <input type="email" defaultValue="minji.kim@example.com" />
              </div>
              <div className="field">
                <label>휴대폰 번호</label>
                <input type="tel" placeholder="010-1234-5678" />
              </div>
              <div className="field">
                <label>생년월일</label>
                <input type="date" />
              </div>
              <div className="field">
                <label>성별</label>
                <select defaultValue="여성">
                  <option>여성</option>
                  <option>남성</option>
                  <option>선택안함</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-primary">수정하기</button>
              </div>
            </form>
          </section>
        )}

        {tab === "favs" && (
          <section className="mp-card">
            <h2 className="mp-subtitle">찜한 간식</h2>
            {favorites.length === 0 ? (
              <p className="mp-empty">아직 찜한 간식이 없습니다.</p>
            ) : (
              <div className="fav-grid">
                {favorites.map((s) => (
                  <article className="fav-card" key={s.id}>
                    <div className="fav-thumb" onClick={() => navigate(`/info?id=${s.id}`)}>
                      <img src={s.image} alt={s.name} onError={(e)=>{ e.currentTarget.style.visibility="hidden"; }}/>
                    </div>
                    <div className="fav-body">
                      <h3 className="fav-name">{s.name}</h3>
                      <p className="fav-brand">{s.brand}</p>
                      <div className="fav-meta">
                        <span className="fav-cat">{s.category}</span>
                        <button className="btn-outline" onClick={() => remove(s.id)}>삭제</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
