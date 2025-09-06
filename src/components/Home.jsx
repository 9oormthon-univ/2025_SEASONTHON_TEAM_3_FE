import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  // 오늘의 간식 (데모 데이터)
  const todaysPicks = [
    {
      id: 101,
      name: "오곡바",
      brand: "실버스낵",
      image: "/images/today-bar.jpg",
      to: "/info", // 상세로 보낼 경로
      tags: ["저당", "식이섬유"],
    },
    {
      id: 102,
      name: "고구마칩",
      brand: "헬시푸드",
      image: "/images/today-chips.jpg",
      to: "/info",
      tags: ["글루텐프리"],
    },
    {
      id: 103,
      name: "캐모마일티",
      brand: "허브하우스",
      image: "/images/today-tea.jpg",
      to: "/info",
      tags: ["카페인없음", "부드러움"],
    },
  ];

  // 컬렉션(카테고리) 그리드
  const collections = [
    { key: "savory", title: "짭짤한 간식", image: "/images/coll-savory.jpg", to: "/find?cat=칩" },
    { key: "sweet", title: "달콤한 간식", image: "/images/coll-sweet.jpg", to: "/find?cat=쿠키" },
    { key: "healthy", title: "건강한 한입", image: "/images/coll-healthy.jpg", to: "/find?badge=저당" },
    { key: "world", title: "세계의 맛", image: "/images/coll-world.jpg", to: "/find" },
    { key: "season", title: "시즌 한정", image: "/images/coll-season.jpg", to: "/find" },
    { key: "diet", title: "식이 옵션", image: "/images/coll-diet.jpg", to: "/find?badge=글루텐프리" },
  ];

  return (
    <main className="home-page">
      {/* 히어로 타이틀 */}
      <section className="hero">
        <h1 className="hero-title">오늘의 간식</h1>
      </section>

      {/* 오늘의 간식 추천 */}
      <section className="today">
        <h2 className="section-title">오늘의 추천 간식</h2>
        <div className="today-grid">
          {todaysPicks.map((s) => (
            <article key={s.id} className="today-card" onClick={() => navigate(s.to)}>
              <div className="today-thumb">
                <img src={s.image} alt={s.name} onError={(e)=>{ e.currentTarget.style.visibility='hidden'; }} />
              </div>
              <div className="today-body">
                <h3 className="today-name">{s.name}</h3>
                <p className="today-brand">{s.brand}</p>
                <div className="today-tags">
                  {s.tags.map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 컬렉션 그리드 */}
      <section className="collections">
        <div className="collection-grid">
          {collections.map((c) => (
            <button
              key={c.key}
              className="collection-card"
              onClick={() => navigate(c.to)}
              aria-label={c.title}
            >
              <img className="collection-img" src={c.image} alt={c.title}
                   onError={(e)=>{ e.currentTarget.style.visibility='hidden'; }} />
              <div className="collection-overlay" />
              <div className="collection-label">{c.title}</div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;
