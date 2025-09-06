import React, { useMemo, useState } from "react";
import "./Find.css";
import { useFavorites } from "./FavoritesContext";

function Heart({ on, ...rest }) {
  return (
    <button type="button" className={`fav-btn ${on ? "on" : ""}`} {...rest} aria-label="찜하기/해제">
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path d="M12 21s-7.2-4.35-9.6-8.4C1 10 2.4 6.6 6 6.6c2 0 3.4 1.1 4 2.1.6-1 2-2.1 4-2.1 3.6 0 5 3.4 3.6 6-2.4 4.05-9.6 8.4-9.6 8.4Z"
          fill={on ? "#e53935" : "rgba(0,0,0,.0)"} stroke={on ? "#e53935" : "#fff"} strokeWidth="1.6"/>
      </svg>
    </button>
  );
}

function Find() {
  const snacks = [
    { id: 1, name: "오곡바", brand: "실버스낵", image: "/images/snack-example.png", category: "바", badges: ["저당","저염","부드러움","카페인없음"] },
    { id: 2, name: "고구마칩", brand: "헬시푸드", image: "/images/snack-sweetpotato.png", category: "칩", badges: ["저당","글루텐프리"] },
    { id: 3, name: "현미쿠키", brand: "그레인랩", image: "/images/snack-cookie.png", category: "쿠키", badges: ["저당"] },
    { id: 4, name: "캐모마일티", brand: "허브하우스", image: "/images/snack-tea.png", category: "음료", badges: ["카페인없음","부드러움"] },
  ];

  const categories = ["전체", "바", "칩", "쿠키", "음료"];
  const badgeOptions = ["저당", "저염", "부드러움", "카페인없음", "글루텐프리"];

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("전체");
  const [selectedBadges, setSelectedBadges] = useState([]);

  const { isFavorite, toggle } = useFavorites();

  function toggleBadge(b) {
    setSelectedBadges((prev) => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  }

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return snacks.filter((s) => {
      const byCat = cat === "전체" ? true : s.category === cat;
      const byText = !text || s.name.toLowerCase().includes(text) || s.brand.toLowerCase().includes(text);
      const byBadges = selectedBadges.length === 0 || selectedBadges.every((b) => s.badges.includes(b));
      return byCat && byText && byBadges;
    });
  }, [q, cat, selectedBadges]);

  return (
    <div className="find-page">
      <div className="toolbar">
        <div className="toolbar-inner">
          <h1 className="find-title">간식찾기</h1>
          <div className="search-row">
            <input className="search-input" type="text" placeholder="간식 이름이나 브랜드로 검색"
                   value={q} onChange={(e) => setQ(e.target.value)} aria-label="간식 검색"/>
          </div>
          <div className="chip-row" role="tablist" aria-label="카테고리">
            {categories.map((c) => (
              <button key={c} className={`chip ${cat === c ? "active" : ""}`}
                      onClick={() => setCat(c)} role="tab" aria-selected={cat === c}>{c}</button>
            ))}
          </div>
          <div className="badge-filter" aria-label="특징 필터">
            {badgeOptions.map((b) => (
              <label key={b} className="badge-check">
                <input type="checkbox" checked={selectedBadges.includes(b)} onChange={() => toggleBadge(b)} />
                <span>{b}</span>
              </label>
            ))}
            {selectedBadges.length > 0 && (
              <button className="reset-btn" onClick={() => setSelectedBadges([])}>선택 초기화</button>
            )}
            <span className="result-count">결과 {filtered.length}개</span>
          </div>
        </div>
      </div>

      <div className="grid">
        {filtered.map((s) => (
          <article key={s.id} className="card">
            <div className="thumb">
              <img src={s.image} alt={s.name} onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
              <Heart
                on={isFavorite(s.id)}
                onClick={() => toggle({ id: s.id, name: s.name, brand: s.brand, image: s.image, category: s.category })}
              />
            </div>
            <div className="card-body">
              <h3 className="snack-name" title={s.name}>{s.name}</h3>
              <p className="snack-brand" title={s.brand}>{s.brand}</p>
              <div className="badge-list">
                {s.badges.slice(0, 3).map((b) => (<span key={b} className="badge">{b}</span>))}
                {s.badges.length > 3 && <span className="badge more">+{s.badges.length - 3}</span>}
              </div>
              <span className="cat-pill">{s.category}</span>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && <div className="empty">검색 결과가 없습니다.</div>}
    </div>
  );
}

export default Find;