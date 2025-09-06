import React, { useMemo, useState } from "react";
import "./Find.css";
import { useFavorites } from "./FavoritesContext";
import { useNavigate } from "react-router-dom"; // ✅ 추가

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
  const navigate = useNavigate(); // ✅ 추가

  const snacks = [
    { id: 1, name: "오곡바", brand: "실버스낵", image: "/images/snack-example.png", category: "바", badges: ["저당","저염","부드러움","카페인없음"] },
    { id: 2, name: "고구마칩", brand: "헬시푸드", image: "/images/snack-sweetpotato.png", category: "칩", badges: ["저당","글루텐프리"] },
    { id: 3, name: "현미쿠키", brand: "그레인랩", image: "/images/snack-cookie.png", category: "쿠키", badges: ["저당"] },
    { id: 4, name: "캐모마일티", brand: "허브하우스", image: "/images/snack-tea.png", category: "음료", badges: ["카페인없음","부드러움"] },
  ];

  const categories = ["전체", "곡물가공품", "즉석식품", "건강보충식", "음료", "유제품", "과자류·빵류·떡", "면류"];

  const catInfo = {
    "건강보충식": { desc: "영양 보충식, 환자식, 노인 맞춤 영양 간식 등 건강 보조 성격의 식품들." },
    "즉석식품": { desc: "간편하게 조리·섭취할 수 있는 죽, 즉석국, 레토르트 식품 등." },
    "곡물가공품": { desc: "곡류 가공품, 오트밀, 현미 등 곡물 기반 가공식품." },
    "음료": { desc: "건강 음료, 곡물 음료, 두유 등 마실 수 있는 형태." },
    "유제품": { desc: "치즈, 우유, 요구르트 등 낙농 기반 제품." },
    "과자류·빵류·떡": { desc: "전통 떡, 빵, 크래커 같은 간식류." },
    "면류": { desc: "국수, 보리국수 같은 면 종류." },
  };

  const filterMap = {
    "전체": null,
    "특수영양식품": ["영양식품"],
    "즉석식품류": ["즉석식품"],
    "농산가공식품류": ["곡물가공품", "농산가공식품류"],
    "음료류": ["음료"],
    "유가공품류": ["유제품"],
    "과자류·빵류·떡류": ["과자,떡,빵", "바", "칩", "쿠키", "빵", "과자", "떡"],
    "면류": ["면류"],
  };

  const badgeOptions = ["저당", "저염", "부드러움", "고단백", "고식이섬유", "카페인없음", "간편섭취", "영양보충"];

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
      const keys = filterMap[cat];
      const byCat = !keys ? true : keys.includes(s.category);
      const byText = !text || s.name.toLowerCase().includes(text) || s.brand.toLowerCase().includes(text);
      const byBadges = selectedBadges.length === 0 || selectedBadges.every((b) => s.badges.includes(b));
      return byCat && byText && byBadges;
    });
  }, [q, cat, selectedBadges]);

  const currentInfo = catInfo[cat];

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
              <button
                key={c}
                className={`chip ${cat === c ? "active" : ""}`}
                onClick={() => setCat(c)}
                role="tab"
                aria-selected={cat === c}
              >
                {c}
              </button>
            ))}
          </div>

          {cat !== "전체" && currentInfo && (
            <div className="cat-desc" role="note" aria-live="polite" style={{ marginTop: 10, fontSize: 14, color: "var(--muted,#6b7280)" }}>
              <div style={{ marginTop: 4 }}>{currentInfo.desc}</div>
            </div>
          )}

          <div className="badge-filter" aria-label="특징 필터" style={{ marginTop: currentInfo ? 10 : 16 }}>
            {badgeOptions.map((b) => (
              <label key={b} className="badge-check">
                <input type="checkbox" checked={selectedBadges.includes(b)} onChange={() => toggleBadge(b)} />
                <span>{b}</span>
              </label>
            ))}
            {selectedBadges.length > 0 && (
              <button className="reset-btn" onClick={() => setSelectedBadges([])}>선택 초기화</button>
            )}
          </div>
        </div>
      </div>

      <div className="grid">
        {filtered.map((s) => (
          <article
            key={s.id}
            className="card"
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/info?name=${encodeURIComponent(s.name)}`)} // ✅ 클릭 시 이동
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(`/info?name=${encodeURIComponent(s.name)}`);
              }
            }}
          >
            <div className="thumb">
              <img src={s.image} alt={s.name} onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
              <Heart
                on={isFavorite(s.id)}
                onClick={(e) => {
                  e.stopPropagation(); // ✅ 카드 이동 막기
                  toggle({ id: s.id, name: s.name, brand: s.brand, image: s.image, category: s.category });
                }}
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
