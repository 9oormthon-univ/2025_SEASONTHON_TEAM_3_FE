import React, { useMemo, useState } from "react";
import "./Find.css";
import { useFavorites } from "./FavoritesContext";
import { useNavigate } from "react-router-dom";

function Heart({ on, ...rest }) {
  return (
    <button
      type="button"
      className={`fav-btn ${on ? "on" : ""}`}
      {...rest}
      aria-label={on ? "찜 해제" : "찜하기"}
      aria-pressed={on}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 20.8C6.8 16.9 3.2 13.9 3.2 10.3 3.2 8 5 6.2 7.3 6.2c1.6 0 3 .8 3.7 2 .8-1.2 2.1-2 3.7-2 2.3 0 4.1 1.8 4.1 4.1 0 3.6-3.6 6.6-9.8 10.5Z"
          fill={on ? "#e53935" : "none"}
          stroke={on ? "#e53935" : "#fff"}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function Find() {
  const navigate = useNavigate();

  // 데모 데이터
  const snacks = [
    { id: 1, name: "오곡바",   brand: "실버스낵",  image: "silver-snack-logo.png", category: "바",   badges: ["저당","저염","부드러움","카페인없음"] },
    { id: 2, name: "고구마칩", brand: "헬시푸드",  image: "silver-snack-logo.png", category: "칩",   badges: ["저당","글루텐프리"] },
    { id: 3, name: "현미쿠키", brand: "그레인랩",  image: "silver-snack-logo.png", category: "쿠키", badges: ["저당"] },
    { id: 4, name: "캐모마일티", brand: "허브하우스", image: "silver-snack-logo.png", category: "음료", badges: ["카페인없음","부드러움"] },
  ];

  // 카테고리 & 설명 (UI 표시용)
  const categories = ["전체", "곡물가공품", "즉석식품", "건강 보충식", "음료", "유제품", "과자류·빵류·떡", "면류"];
  const catInfo = {
    "건강 보충식": { desc: "영양 보충식, 환자식, 노인 맞춤 영양 간식 등 건강 보조 성격의 식품들." },
    "즉석식품": { desc: "간편하게 조리·섭취할 수 있는 죽, 즉석국, 레토르트 식품 등." },
    "곡물가공품": { desc: "곡류 가공품, 오트밀, 현미 등 곡물 기반 가공식품." },
    "음료": { desc: "건강 음료, 곡물 음료, 두유 등 마실 수 있는 형태." },
    "유제품": { desc: "치즈, 우유, 요구르트 등 낙농 기반 제품." },
    "과자류·빵류·떡": { desc: "전통 떡, 빵, 크래커 같은 간식류." },
    "면류": { desc: "국수, 보리국수 같은 면 종류." },
  };

  // 실제 필터에 쓸 매핑
  const filterMap = {
    "전체": null,
    "건강 보충식": ["건강보충식", "영양식품"],
    "즉석식품": ["즉석식품"],
    "곡물가공품": ["곡물가공품", "농산가공식품류"],
    "음료": ["음료"],
    "유제품": ["유제품"],
    "과자류·빵류·떡": ["과자,떡,빵", "바", "칩", "쿠키", "빵", "과자", "떡"],
    "면류": ["면류"],
  };

  const badgeOptions = ["저당", "저염", "부드러움", "고단백", "고식이섬유", "카페인없음", "간편섭취", "영양보충"];

  // ✅ 적용된(Committed) 상태 — 실제 필터링에 사용
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("전체");
  const [selectedBadges, setSelectedBadges] = useState([]);

  // ✅ 초안(Draft) 상태 — UI에서 선택만 하고, 검색 버튼 클릭 시에만 위로 반영
  const [qDraft, setQDraft] = useState("");
  const [catDraft, setCatDraft] = useState("전체");
  const [selectedBadgesDraft, setSelectedBadgesDraft] = useState([]);

  // 드래프트에서 배지 토글
  function toggleBadgeDraft(b) {
    setSelectedBadgesDraft((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
    );
  }

  // ✅ 검색 버튼: 드래프트 → 적용
  function applySearch() {
    setQ(qDraft);
    setCat(catDraft);
    setSelectedBadges(selectedBadgesDraft);
  }

  // (선택) 전체 초기화: 드래프트/적용 상태 모두 리셋
  function resetAll() {
    setQ(""); setQDraft("");
    setCat("전체"); setCatDraft("전체");
    setSelectedBadges([]); setSelectedBadgesDraft([]);
  }

  // 실제 필터링은 "적용된 상태"만 사용
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

  const currentInfo = catInfo[catDraft]; // 설명은 드래프트 기준으로 즉시 표시

  const { isFavorite, toggle } = useFavorites();

  return (
    <div className="find-page">
      <div className="toolbar">
        <div className="toolbar-inner">
          <h1 className="find-title">간식찾기</h1>

          {/* 검색어 입력 (Enter로도 검색 적용) */}
          <div className="search-row">
            <input
              className="search-input"
              type="text"
              placeholder="간식 이름이나 브랜드로 검색"
              value={qDraft}
              onChange={(e) => setQDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") applySearch(); }}
              aria-label="간식 검색"
            />
                        <button className="search-btn" onClick={applySearch}>검색</button>
          </div>
          

          {/* 카테고리 — 드래프트만 변경 */}
          <div className="chip-row" role="tablist" aria-label="카테고리">
            {categories.map((c) => (
              <button
                key={c}
                className={`chip ${catDraft === c ? "active" : ""}`}
                onClick={() => setCatDraft(c)}
                role="tab"
                aria-selected={catDraft === c}
              >
                {c}
              </button>
            ))}
          </div>

          {/* 카테고리 설명(선택 시 즉시 표시) */}
          {catDraft !== "전체" && currentInfo && (
            <div className="cat-desc" role="note" aria-live="polite" style={{ marginTop: 10, fontSize: 14, color: "var(--muted,#6b7280)" }}>
              <div style={{ marginTop: 4 }}>{currentInfo.desc}</div>
            </div>
          )}

          {/* 배지 필터 — 드래프트만 변경 */}
          <div className="badge-filter" aria-label="특징 필터" style={{ marginTop: currentInfo ? 10 : 16 }}>
            {badgeOptions.map((b) => (
              <label key={b} className="badge-check">
                <input
                  type="checkbox"
                  checked={selectedBadgesDraft.includes(b)}
                  onChange={() => toggleBadgeDraft(b)}
                />
                <span>{b}</span>
              </label>
            ))}

            {selectedBadgesDraft.length > 0 && (
              <button className="reset-btn" onClick={() => setSelectedBadgesDraft([])}>
                선택 초기화
              </button>
            )}

            {/* 적용된 결과 개수(적용 상태 기준) */}
            <span className="result-count">결과 {filtered.length}개</span>
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
            onClick={() => navigate(`/info?name=${encodeURIComponent(s.name)}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(`/info?name=${encodeURIComponent(s.name)}`);
              }
            }}
          >
            {/* 카드 상단 이미지 박스 */}
            <div className="thumb">
              <img
                src={s.image}
                alt={s.name}
                onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
              />
              <Heart
                on={isFavorite(s.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  toggle({ id: s.id, name: s.name, brand: s.brand, image: s.image, category: s.category });
                }}
              />
            </div>

            {/* 본문 */}
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
