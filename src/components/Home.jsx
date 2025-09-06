import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  // 전체 후보(데모 데이터) — 알레르겐/태그 포함
  const ALL_SNACKS = [
    { id: 101, name: "오곡바",     brand: "실버스낵",  image: "silver-snack-logo.png",   tags: ["저당", "식이섬유"],},
    { id: 102, name: "고구마칩",   brand: "헬시푸드",  image: "silver-snack-logo.png", tags: ["저당", "글루텐프리"],},
    { id: 103, name: "캐모마일티", brand: "허브하우스", image: "silver-snack-logo.png",   tags: ["카페인없음", "부드러움", "저염"]},
    // ▼ 섹션용으로 항목 확장 (이미지 없으면 onError로 숨김 처리됨)
    { id: 104, name: "현미쿠키",       brand: "그레인랩",   image: "silver-snack-logo.png",  tags: ["저당"] },
  ];

  // 건강상태 → 추천 태그 매핑 (간단 스코어링)
  const PREFER_TAGS = {
    BLOOD_SUGAR: ["저당", "식이섬유"],     // 혈당 관리
    BLOOD_PRESSURE: ["저염"],             // 혈압 관리
    CHOLESTEROL: ["저염"],                // 데모: 저염으로 근사
    WEIGHT_CONTROL: ["저당", "식이섬유"], // 체중 관리
    KIDNEY: ["저염"],                    // 신장
    HEART: ["저염"],                     // 심혈관
  };

  // 알레르기 enum → 라벨 매핑
  const ALLERGY_LABELS = {
    MILK: "우유",
    EGG: "계란",
    WHEAT: "밀",
    SOY: "대두",
    PEANUT: "땅콩", 
    TREE_NUT: "견과류", 
    FISH: "생선",
    SHELLFISH: "조개/갑각류", 
    SESAME: "참깨", 
    BUCKWHEAT: "메밀",
  };

  // 사용자 건강정보
  const userHealthConcerns = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("healthConcerns") || "[]"); } catch { return []; }
  }, []);
  const userAllergyLabels = useMemo(() => {
    try {
      const codes = JSON.parse(localStorage.getItem("allergies") || "[]");
      return Array.isArray(codes) ? codes.map(c => ALLERGY_LABELS[c] || c) : [];
    } catch { return []; }
  }, []);

  // 알레르기 충돌 필터
  const noAllergyConflict = (snack) => {
    if (!snack.allergens || snack.allergens.length === 0) return true;
    return !userAllergyLabels.some(a => snack.allergens.includes(a));
  };

  // 스코어 계산
  const scoreSnack = (snack) => {
    if (!userHealthConcerns || userHealthConcerns.length === 0) return 0;
    const set = new Set(snack.tags || []);
    let score = 0;
    for (const hc of userHealthConcerns) {
      const prefs = PREFER_TAGS[hc] || [];
      for (const t of prefs) if (set.has(t)) score += 1;
    }
    return score;
  };

  // 개인화 추천 (1섹션)
  const picks = useMemo(() => {
    const candidates = ALL_SNACKS.filter(noAllergyConflict)
      .map(s => ({ ...s, _score: scoreSnack(s) }))
      .sort((a, b) => b._score - a._score);

    const hasPersonalization =
      (userHealthConcerns?.length || 0) > 0 ||
      (userAllergyLabels?.length || 0) > 0;

    if (!hasPersonalization) {
      return ALL_SNACKS.slice(0, 6); // 섹션이라 6개로 확대
    }
    const positive = candidates.filter(s => s._score > 0).slice(0, 10);
    return positive.length > 0 ? positive : candidates.slice(0, 10);
  }, [ALL_SNACKS, userHealthConcerns, userAllergyLabels]);

  const title =
    (userHealthConcerns.length > 0 || userAllergyLabels.length > 0)
      ? "맞춤 추천간식"
      : "오늘의 추천간식";

  // 기타 섹션
  const catalog = ALL_SNACKS.filter(noAllergyConflict);
  const sections = [
    { key: "picks", title, items: picks },
  ];

  return (
    <main className="home-page">
      {/* 히어로 */}
      <section className="hero">
        <h1 className="hero-title">{title}</h1>
        {(userHealthConcerns.length > 0 || userAllergyLabels.length > 0) && (
          <p style={{ marginTop: 6, color: "rgba(0,0,0,.6)", fontSize: 14 }}>
            {userHealthConcerns.length > 0 && <>건강상태 기준: {userHealthConcerns.join(", ")} </>}
            {userAllergyLabels.length > 0 && <>· 알레르기 제외: {userAllergyLabels.join(", ")}</>}
          </p>
        )}
      </section>

      {/* 가로 스크롤 섹션들 */}
      {sections.map(sec => sec.items.length > 0 && (
        <section key={sec.key} className="hsec">
          <div className="hsec-head">
            <h2 className="hsec-title">{sec.title}</h2>
            <span className="hsec-count">{sec.items.length}개</span>
          </div>

          {/* 카드만 가로 스크롤 */}
          <div className="hrow" role="list">
            {sec.items.map((s) => (
              <article
                key={s.id}
                className="today-card hcard"
                role="listitem"
                onClick={() => navigate(`/info?name=${encodeURIComponent(s.name)}`)}
              >
                <div className="today-thumb">
                  <img
                    src={s.image}
                    alt={s.name}
                    onError={(e)=>{ e.currentTarget.style.visibility='hidden'; }}
                  />
                </div>
                <div className="today-body">
                  <h3 className="today-name" title={s.name}>{s.name}</h3>
                  <p className="today-brand" title={s.brand}>{s.brand}</p>
                  <div className="today-tags">
                    {(s.tags || []).slice(0, 3).map((t) => (
                      <span key={t} className="tag">{t}</span>
                    ))}
                    {(s.tags?.length || 0) > 3 && (
                      <span className="tag more">+{s.tags.length - 3}</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}

export default Home;
