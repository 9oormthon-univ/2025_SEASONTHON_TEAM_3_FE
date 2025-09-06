import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Find.css";
import { useFavorites } from "./FavoritesContext";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";

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

const CATEGORIES = ["전체", "영양식품", "즉석식품", "곡물가공품", "음료", "유제품", "과자,떡,빵", "면류"];
const CAT_INFO = {
  "영양식품": "영양 보충식, 환자식, 노인 맞춤 영양 간식 등 건강 보조 성격의 식품들.",
  "즉석식품": "간편하게 조리·섭취할 수 있는 죽, 즉석국, 레토르트 식품 등.",
  "곡물가공품": "곡류 가공품, 오트밀, 현미 등 곡물 기반 가공식품.",
  "음료": "건강 음료, 곡물 음료, 두유 등 마실 수 있는 형태.",
  "유제품": "치즈, 우유, 요구르트 등 낙농 기반 제품.",
  "과자,떡,빵": "전통 떡, 빵, 크래커 같은 간식류.",
  "면류": "국수, 보리국수 같은 면 종류.",
};
const BADGE_OPTIONS = ["저당", "저염", "부드러움", "고단백", "고식이섬유", "카페인없음", "간편섭취", "영양보충"];

// ✅ 3×2 = 6 고정
const PAGE_SIZE = 6;

// 백엔드 베이스
const API_BASE =
  (import.meta.env.VITE_API_BASE && import.meta.env.VITE_API_BASE.trim()) ||
  (location.hostname === "localhost" ? "http://3.35.209.210:8080" : "");
const LIST_URL = `${API_BASE}/api/snacks`;

export default function Find() {
  const navigate = useNavigate();
  const { isFavorite, toggle } = useFavorites();
  const abortRef = useRef(null);

  // 실제 적용 상태
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("전체");
  const [badges, setBadges] = useState([]);
  const [page, setPage] = useState(0);

  // 드래프트
  const [qDraft, setQDraft] = useState("");
  const [catDraft, setCatDraft] = useState("전체");
  const [badgesDraft, setBadgesDraft] = useState([]);

  // 목록
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const toggleBadgeDraft = (b) =>
    setBadgesDraft((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));

  const applySearch = () => {
    setQ(qDraft.trim());
    setCat(catDraft);
    setBadges(badgesDraft.slice());
    setPage(0);
  };

  const resetAll = () => {
    setQ(""); setQDraft("");
    setCat("전체"); setCatDraft("전체");
    setBadges([]); setBadgesDraft([]);
    setPage(0);
  };

  // ====== API 호출 (size=6 강제, 6개 초과시 slice) ======
  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setErr("");

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("size", String(PAGE_SIZE)); // ← 6
    if (q) params.set("keyword", q);
    if (cat && cat !== "전체") params.set("category", cat);
    (badges || []).forEach((h) => params.append("hashtags", h));

    const url = `${LIST_URL}?${params.toString()}`;
    // console.log("[Find] fetch:", url);

    const pickPage = (j) => {
      if (!j) return { content: [], totalPages: 0, totalElements: 0 };
      if (j.result?.content) return j.result;
      if (j.content) return j;
      if (j.data?.content) return j.data;
      return { content: [], totalPages: 0, totalElements: 0 };
    };

    fetch(url, { signal: controller.signal })
      .then(async (res) => {
        const text = await res.text();
        let json = null; try { json = text ? JSON.parse(text) : null; } catch {}
        if (!res.ok) throw new Error(json?.message || json?.errorCode || `HTTP ${res.status}`);
        if (json && "success" in json && json.success === false) {
          throw new Error(json?.message || json?.errorCode || "요청 실패");
        }
        const pg = pickPage(json);
        const content = Array.isArray(pg.content) ? pg.content : [];

        const mapped = content.slice(0, PAGE_SIZE).map((it) => ({
          id: it.id,
          name: it.name,
          brand: it.manufacturer,
          image: it.imageUrl || "/images/silver-snack-logo.png",
          category: it.snackCategory,
          badges: Array.isArray(it.hashtags) ? it.hashtags : [],
        }));

        setItems(mapped);
        setTotalPages(pg.totalPages ?? 0);
        setTotalElements(pg.totalElements ?? mapped.length);
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        setErr(e.message || "목록을 불러오지 못했습니다.");
        setItems([]);
        setTotalPages(0);
        setTotalElements(0);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [q, cat, badges, page]);

  const resultText = useMemo(() => {
    if (!totalElements) return "결과 0개";
    const start = page * PAGE_SIZE + 1;
    const end = Math.min((page + 1) * PAGE_SIZE, totalElements);
    return `결과 ${totalElements}개 ( ${start}–${end} )`;
  }, [page, totalElements]);

  const onThumbError = (e) => {
    const img = e.currentTarget;
    if (img.dataset.fallback === "1") return;
    img.dataset.fallback = "1";
    img.src = "/images/silver-snack-logo.png";
    img.style.objectFit = "contain";
    img.style.padding = "16px";
    img.style.background = "#fff";
  };

  const currentInfo = catDraft !== "전체" ? CAT_INFO[catDraft] : null;

  return (
    <div className="find-page">
      <div className="toolbar">
        <div className="toolbar-inner">
          <h1 className="find-title">간식찾기</h1>

          <div className="search-row">
            <input
              className="search-input"
              type="text"
              placeholder="간식 이름이나 제조사로 검색"
              value={qDraft}
              onChange={(e) => setQDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") applySearch(); }}
              aria-label="간식 검색"
            />
            <button className="reset-btn" onClick={applySearch}>검색</button>
            <button className="reset-btn" onClick={resetAll}>초기화</button>
          </div>

          <div className="chip-row" role="tablist" aria-label="카테고리">
            {CATEGORIES.map((c) => (
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

          {currentInfo && (
            <div className="cat-desc" role="note" aria-live="polite">
              {currentInfo}
            </div>
          )}

          <div className="badge-filter" aria-label="특징 필터">
            {BADGE_OPTIONS.map((b) => (
              <label key={b} className="badge-check">
                <input
                  type="checkbox"
                  checked={badgesDraft.includes(b)}
                  onChange={() => toggleBadgeDraft(b)}
                />
                <span>{b}</span>
              </label>
            ))}
            {badgesDraft.length > 0 && (
              <button className="reset-btn" onClick={() => setBadgesDraft([])}>선택 초기화</button>
            )}
            <span className="result-count">{resultText}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 24 }}><Loading variant="dots" text="불러오는 중..." /></div>
      ) : err ? (
        <div className="empty">오류: {err}</div>
      ) : (
        <>
          {/* ✅ 3열 그리드 → 한 페이지에 6개면 2줄로 정확히 렌더 */}
          <div className="grid grid-3">
            {items.map((s) => (
              <article
                key={s.id}
                className="card"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/info?id=${encodeURIComponent(s.id)}`)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(`/info?id=${encodeURIComponent(s.id)}`); } }}
              >
                <div className="thumb">
                  <img src={s.image} alt={s.name} onError={onThumbError} />
                  <Heart
                    on={isFavorite(s.id)}
                    onClick={(e) => {
                      e.stopPropagation();
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

          {totalPages > 1 && (
            <div className="pager">
              <button className="reset-btn" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>이전</button>
              <span className="pager-info">{page + 1} / {totalPages}</span>
              <button className="reset-btn" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}>다음</button>
            </div>
          )}

          {items.length === 0 && <div className="empty">검색 결과가 없습니다.</div>}
        </>
      )}
    </div>
  );
}
