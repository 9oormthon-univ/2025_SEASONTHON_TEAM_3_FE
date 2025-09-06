// Home.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  // ✅ 백엔드 베이스 URL
  const API_BASE = import.meta.env.VITE_API_BASE || "http://3.35.209.210:8080";
  const RECO_URL = `${API_BASE}/recommend`;

  // ✅ 선택 가능한 카테고리(백엔드 스키마와 동일 문자)
  const CATEGORIES = [
    "건강 보충식",
    "즉석식품",
    "곡물가공품",
    "음료",
    "유제품",
    "과자,떡,빵",
    "면류",
  ];

  // ✅ 상태
  const [selectedCats, setSelectedCats] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("reco_cats") || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [items, setItems] = useState([]); // 추천 결과
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // ✅ 토큰 (있으면 Authorization 추가)
  const token = useMemo(() => localStorage.getItem("accessToken") || "", []);

  // 카테고리 토글
  const toggleCat = (cat) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // 초기 1회 자동 추천
  useEffect(() => {
    handleRecommend(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 추천 요청
  async function handleRecommend(saveCats = true) {
    if (saveCats) localStorage.setItem("reco_cats", JSON.stringify(selectedCats));

    setLoading(true);
    setErrMsg("");

    try {
      const res = await fetch(RECO_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          snackCategories: selectedCats, // 선택 없으면 빈 배열 → 건강정보만으로 추천
        }),
      });

      const text = await res.text();
      let json = null;
      try { json = text ? JSON.parse(text) : null; } catch {}

      if (!res.ok || json?.success === false) {
        const msg = json?.message || json?.errorCode || `추천 실패 (HTTP ${res.status})`;
        setErrMsg(msg);
        setItems([]);
        setLoading(false);
        return;
      }

      const list = json?.result?.recommendations || [];
      setItems(list);
    } catch {
      setErrMsg("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  const title = "맞춤 추천간식";

  return (
    <main className="home-page">
      {/* 히어로/타이틀 */}
      <section className="hero">
        <h1 className="hero-title">{title}</h1>
        <p style={{ marginTop: 6, color: "rgba(0,0,0,.6)", fontSize: 14 }}>
          가입 시 입력한 건강 정보/알레르기 기반 추천이에요. 필요하면 카테고리를 골라 더 좁혀보세요.
        </p>
      </section>

      {/* 카테고리 선택 + 추천 버튼 (CSS의 tag 스타일 재사용) */}
      <section className="hsec" style={{ paddingTop: 0 }}>
        <div className="hsec-head" style={{ alignItems: "center", gap: 8 }}>
          <h2 className="hsec-title">카테고리 선택</h2>

          <button
            type="button"
            className="tag"
            style={{ borderColor: "#cfe8d1", padding: "6px 12px" }}
            onClick={() => handleRecommend(true)}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "추천 불러오는 중…" : "추천받기"}
          </button>
        </div>

        <div className="today-tags" role="group" aria-label="간식 카테고리">
          {CATEGORIES.map((c) => {
            const active = selectedCats.includes(c);
            return (
              <button
                key={c}
                type="button"
                className="tag"
                onClick={() => toggleCat(c)}
                aria-pressed={active}
                title={c}
                style={{
                  cursor: "pointer",
                  ...(active
                    ? { background: "#2e7d32", color: "#fff", borderColor: "#2e7d32" }
                    : null),
                }}
              >
                {c}
              </button>
            );
          })}
          {selectedCats.length > 0 && (
            <button
              type="button"
              className="tag"
              onClick={() => setSelectedCats([])}
              title="선택 해제"
              style={{ cursor: "pointer" }}
            >
              선택 해제
            </button>
          )}
        </div>
      </section>

      {/* 에러 메시지 */}
      {errMsg && (
        <div style={{ maxWidth: 1100, margin: "8px auto 0", padding: "0 16px", color: "#b00020" }}>
          {errMsg}
        </div>
      )}

      {/* 추천 카드 그리드 (CSS: today-*) */}
      <section>
        <div className="today-grid">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <article key={i} className="today-card" aria-busy="true">
                <div className="today-thumb" />
                <div className="today-body">
                  <h3 className="today-name">불러오는 중…</h3>
                  <p className="today-brand">&nbsp;</p>
                  <div className="today-tags">
                    <span className="tag">…</span>
                  </div>
                </div>
              </article>
            ))}

          {!loading &&
            items.map((s) => (
              <article
                key={s.id}
                className="today-card"
                onClick={() => navigate(`/info?id=${encodeURIComponent(s.id)}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" ? navigate(`/info?id=${encodeURIComponent(s.id)}`) : null)}
                title={s.name}
              >
                <div className="today-thumb">
                  <img
                    src={s.imageUrl || "/silver-snack-logo.png"}
                    alt={s.name}
                    onError={(e) => {
                      e.currentTarget.src = "/silver-snack-logo.png";
                    }}
                  />
                </div>
                <div className="today-body">
                  <h3 className="today-name" title={s.name}>{s.name}</h3>
                  <p className="today-brand" title={s.manufacturer}>{s.manufacturer}</p>
                  <div className="today-tags">
                    {s.snackCategory && <span className="tag">{s.snackCategory}</span>}
                    {s.allergyInfo && <span className="tag">{s.allergyInfo}</span>}
                  </div>
                  {s.reason && (
                    <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(0,0,0,.6)" }}>
                      {s.reason}
                    </p>
                  )}
                </div>
              </article>
            ))}
        </div>

        {!loading && items.length === 0 && !errMsg && (
          <div style={{ maxWidth: 1100, margin: "14px auto", padding: "0 16px", color: "#666" }}>
            추천 결과가 없습니다. 카테고리를 바꿔 다시 시도해보세요.
          </div>
        )}
      </section>
    </main>
  );
}

export default Home;
