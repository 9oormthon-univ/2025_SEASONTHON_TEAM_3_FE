import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  // 전체 후보(데모 데이터) — 알레르겐/태그 포함
  const ALL_SNACKS = [
    {
      id: 101,
      name: "오곡바",
      brand: "실버스낵",
      image: "/images/today-bar.jpg",
      tags: ["저당", "식이섬유"],
      allergens: ["우유", "대두", "밀"],
    },
    {
      id: 102,
      name: "고구마칩",
      brand: "헬시푸드",
      image: "/images/today-chips.jpg",
      tags: ["저당", "글루텐프리"],
      allergens: [], // 없음
    },
    {
      id: 103,
      name: "캐모마일티",
      brand: "허브하우스",
      image: "/images/today-tea.jpg",
      tags: ["카페인없음", "부드러움", "저염"],
      allergens: [], // 없음
    },
    // 필요시 더 추가 가능
  ];

  // 건강상태 → 추천 태그 매핑 (간단 스코어링)
  const PREFER_TAGS = {
    BLOOD_SUGAR: ["저당", "식이섬유"],       // 혈당 관리
    BLOOD_PRESSURE: ["저염"],               // 혈압 관리
    CHOLESTEROL: ["저염"],                  // (데모용: 태그 셋에 '저지방'이 없어 저염으로 근사)
    WEIGHT_CONTROL: ["저당", "식이섬유"],   // 체중 관리
    KIDNEY: ["저염"],                      // 신장 건강
    HEART: ["저염"],                       // 심혈관 건강
  };

  // 알레르기 enum → 라벨 매핑 (Signup/MyPage에서 저장된 enum 값을 라벨로 변환)
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

  // 사용자 건강정보 가져오기
  const userHealthConcerns = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("healthConcerns") || "[]"); } catch { return []; }
  }, []);
  const userAllergyLabels = useMemo(() => {
    try {
      const codes = JSON.parse(localStorage.getItem("allergies") || "[]");
      return Array.isArray(codes) ? codes.map(c => ALLERGY_LABELS[c] || c) : [];
    } catch {
      return [];
    }
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

  // 추천 계산
  const picks = useMemo(() => {
    const candidates = ALL_SNACKS.filter(noAllergyConflict)
      .map(s => ({ ...s, _score: scoreSnack(s) }))
      .sort((a, b) => b._score - a._score);

    // 건강정보/알레르기 둘 다 비어있으면 기존 Today 느낌으로 앞에서 3개
    const hasPersonalization = (userHealthConcerns?.length || 0) > 0 || (userAllergyLabels?.length || 0) > 0;

    if (!hasPersonalization) {
      return ALL_SNACKS.slice(0, 3);
    }

    // 점수 > 0 인 항목 우선, 없으면 알레르기만 제외하고 상위 3개
    const positive = candidates.filter(s => s._score > 0).slice(0, 3);
    return positive.length > 0 ? positive : candidates.slice(0, 3);
  }, [ALL_SNACKS, userHealthConcerns, userAllergyLabels]);

  const title =
    (userHealthConcerns.length > 0 || userAllergyLabels.length > 0)
      ? "맞춤 추천간식"
      : "오늘의 추천간식";

  return (
    <main className="home-page">
      {/* 히어로 타이틀 */}
      <section className="hero">
        <h1 className="hero-title">{title}</h1>
        {(userHealthConcerns.length > 0 || userAllergyLabels.length > 0) && (
          <p style={{ marginTop: 6, color: "rgba(0,0,0,.6)", fontSize: 25 }}>
            {userHealthConcerns.length > 0 && <>건강상태 기준: {userHealthConcerns.join(", ")} </>}
            {userAllergyLabels.length > 0 && <>· 알레르기 제외: {userAllergyLabels.join(", ")}</>}
          </p>
        )}
      </section>

      {/* 추천 카드 */}
      <section>
        <div className="today-grid">
          {picks.map((s) => (
            <article
              key={s.id}
              className="today-card"
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
                <h3 className="today-name">{s.name}</h3>
                <p className="today-brand">{s.brand}</p>
                <div className="today-tags">
                  {(s.tags || []).map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;
