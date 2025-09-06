import React, { useEffect, useMemo, useState } from "react";
import "./MyPage.css";
import { useFavorites } from "./FavoritesContext";
import { useNavigate } from "react-router-dom";

export default function MyPage() {
  const navigate = useNavigate();
  const { favorites, remove } = useFavorites();
  const [tab, setTab] = useState("profile"); // 'profile' | 'favs'

  // ✅ 이름/이메일 (Signup 연동)
  const [profile, setProfile] = useState({ username: "", email: "" });
  useEffect(() => {
    const username = localStorage.getItem("signup_username") || "김민지";
    const email = localStorage.getItem("signup_email") || "minji.kim@example.com";
    setProfile({ username, email });
  }, []);

  // ✅ 건강상태/알레르기 (표시용 라벨/순서)
  const HEALTH_ITEMS = [
    { value: "BLOOD_SUGAR",    label: "혈당" },
    { value: "BLOOD_PRESSURE", label: "고혈압" },
    { value: "CHOLESTEROL",    label: "콜레스테롤" },
    { value: "WEIGHT_CONTROL", label: "체중 관리" },
    { value: "KIDNEY",         label: "신장" },
    { value: "HEART",          label: "심혈관" },
  ];
  const ALLERGY_ITEMS = [
    { value: "MILK",      label: "우유" },
    { value: "EGG",       label: "계란" },
    { value: "WHEAT",     label: "밀" },
    { value: "SOY",       label: "대두" },
    { value: "PEANUT",    label: "땅콩" },
    { value: "TREE_NUT",  label: "견과류" },
    { value: "FISH",      label: "생선" },
    { value: "SHELLFISH", label: "조개/갑각류" },
    { value: "SESAME",    label: "참깨" },
    { value: "BUCKWHEAT", label: "메밀" },
  ];
  const HC_LABELS = Object.fromEntries(HEALTH_ITEMS.map(i => [i.value, i.label]));
  const AL_LABELS = Object.fromEntries(ALLERGY_ITEMS.map(i => [i.value, i.label]));
  const HC_ORDER = HEALTH_ITEMS.map(i => i.value);
  const AL_ORDER = ALLERGY_ITEMS.map(i => i.value);

  // ✅ 저장된 선택값 로드
  const [healthConcerns, setHealthConcerns] = useState([]);
  const [allergies, setAllergies] = useState([]);
  useEffect(() => {
    try {
      const hc = JSON.parse(localStorage.getItem("healthConcerns") || "[]");
      const al = JSON.parse(localStorage.getItem("allergies") || "[]");
      setHealthConcerns(Array.isArray(hc) ? hc : []);
      setAllergies(Array.isArray(al) ? al : []);
    } catch {
      setHealthConcerns([]);
      setAllergies([]);
    }
  }, []);

  // ✅ 정렬된 표시용
  const hcSorted = useMemo(
    () => healthConcerns.slice().sort((a, b) => HC_ORDER.indexOf(a) - HC_ORDER.indexOf(b)),
    [healthConcerns]
  );
  const alSorted = useMemo(
    () => allergies.slice().sort((a, b) => AL_ORDER.indexOf(a) - AL_ORDER.indexOf(b)),
    [allergies]
  );

  // ✅ 편집 모드 (초안 상태)
  const [editMode, setEditMode] = useState(false);
  const [draftHC, setDraftHC] = useState([]);
  const [draftAL, setDraftAL] = useState([]);

  const startEdit = () => {
    setDraftHC(healthConcerns);
    setDraftAL(allergies);
    setEditMode(true);
  };
  const cancelEdit = () => {
    setEditMode(false);
  };

  // ✅ 저장: 프로필 + 건강정보 한 번에
  const saveEdit = () => {
    // 1) 프로필 저장
    localStorage.setItem("signup_username", profile.username);
    localStorage.setItem("signup_email", profile.email);

    // 2) 건강정보 저장
    setHealthConcerns(draftHC);
    setAllergies(draftAL);
    localStorage.setItem("healthConcerns", JSON.stringify(draftHC));
    localStorage.setItem("allergies", JSON.stringify(draftAL));

    setEditMode(false);
    alert("프로필 및 건강 정보가 저장되었습니다.");
  };

  // ✅ 칩 토글 (편집 모드용 초안)
  const toggleDraftHC = (val) => {
    setDraftHC((prev) => (prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]));
  };
  const toggleDraftAL = (val) => {
    setDraftAL((prev) => (prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]));
  };
  const clearDraftHC = () => setDraftHC([]);
  const clearDraftAL = () => setDraftAL([]);

  return (
    <div className="mypage">
      {/* 사이드바 */}
      <aside className="mp-sidebar">
        <div className="mp-user">
          <img className="mp-avatar" src="silver-snack-logo.png" alt="user" />
          <div>
            <strong className="mp-name">{profile.username || "사용자"}</strong>
          </div>
        </div>

        {/* 요약 뱃지 */}
        <div className="mp-brief">
          <div className="mp-brief-sec">
            <div className="mp-brief-title">건강상태</div>
            <div className="hc-chip-row" style={{ marginTop: 8 }}>
              {hcSorted.length > 0 ? (
                hcSorted.map((v) => (
                  <span key={v} className="hc-chip is-active" aria-hidden="true">
                    <span className="hc-dot" />
                    <span>{HC_LABELS[v] ?? v}</span>
                  </span>
                ))
              ) : (
                <span className="hc-chip hc-none is-active">없음</span>
              )}
            </div>
          </div>

          <div className="mp-brief-sec" style={{ marginTop: 12 }}>
            <div className="mp-brief-title">알레르기</div>
            <div className="hc-chip-row" style={{ marginTop: 8 }}>
              {alSorted.length > 0 ? (
                alSorted.map((v) => (
                  <span key={v} className="hc-chip is-active" aria-hidden="true">
                    <span className="hc-dot" />
                    <span>{AL_LABELS[v] ?? v}</span>
                  </span>
                ))
              ) : (
                <span className="hc-chip hc-none is-active">없음</span>
              )}
            </div>
          </div>
        </div>

        <nav className="mp-nav" style={{ marginTop: 16 }}>
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
            <h2 className="mp-subtitle" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {!editMode ? (
                <button type="button" className="btn-outline" onClick={startEdit}>회원 정보 수정</button>
              ) : (
                <span />
            )}
            </h2>
            {/* 프로필(이름/이메일) — 저장은 하단 '저장' 버튼에서 함께 처리 */}
            <form className="mp-form" style={{ marginTop: 24 }} onSubmit={(e)=>e.preventDefault()}>
              <div className="field">
                <label>이름</label>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e)=>setProfile(p=>({...p, username: e.target.value}))}
                />
              </div>
              <div className="field">
                <label>이메일</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e)=>setProfile(p=>({...p, email: e.target.value}))}
                />
              </div>
            </form>

            <h2 className="mp-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", }}>
              건강 정보
            </h2>

            {/* ✅ 보기 모드 */}
            {!editMode && (
              <>
                <div className="hc-section">
                  <div className="hc-head">
                    <div className="label" style={{padding: "0.5rem"}}>건강상태</div>
                  </div>
                  <div className="hc-chip-row">
                    {hcSorted.length > 0 ? (
                      hcSorted.map((v) => (
                        <span key={v} className="hc-chip is-active" aria-hidden="true">
                          <span className="hc-dot" />
                          <span>{HC_LABELS[v] ?? v}</span>
                        </span>
                      ))
                    ) : (
                      <span className="hc-chip hc-none is-active">없음</span>
                    )}
                  </div>
                </div>

                <div className="hc-section" style={{ marginTop: 12 }}>
                  <div className="hc-head">
                    <div className="label" style={{padding: "0.5rem"}}>알레르기</div>
                  </div>
                  <div className="hc-chip-row">
                    {alSorted.length > 0 ? (
                      alSorted.map((v) => (
                        <span key={v} className="hc-chip is-active" aria-hidden="true">
                          <span className="hc-dot" />
                          <span>{AL_LABELS[v] ?? v}</span>
                        </span>
                      ))
                    ) : (
                      <span className="hc-chip hc-none is-active">없음</span>
                    )}
                  </div>
                </div>
              </>
            )}
            
            {/* ✅ 편집 모드 */}
            {editMode && (
              <>
                <div className="hc-section">
                  <div className="hc-head">
                    <div className="label">건강상태 (다중 선택)</div>
                  </div>
                  <div className="hc-chip-row" role="group" aria-label="건강상태 편집">
                    {HEALTH_ITEMS.map(({ value, label }) => {
                      const active = draftHC.includes(value);
                      return (
                        <button
                          key={value}
                          type="button"
                          className={`hc-chip ${active ? "is-active" : ""}`}
                          aria-pressed={active}
                          role="checkbox"
                          onClick={() => toggleDraftHC(value)}
                        >
                          <span className="hc-dot" aria-hidden />
                          <span>{label}</span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      className={`hc-chip hc-none ${draftHC.length === 0 ? "is-active" : ""}`}
                      aria-pressed={draftHC.length === 0}
                      onClick={clearDraftHC}
                    >
                      없음
                    </button>
                  </div>
                </div>

                <div className="hc-section" style={{ marginTop: 12 }}>
                  <div className="hc-head">
                    <div className="label">알레르기 (다중 선택)</div>
                  </div>
                  <div className="hc-chip-row" role="group" aria-label="알레르기 편집">
                    {ALLERGY_ITEMS.map(({ value, label }) => {
                      const active = draftAL.includes(value);
                      return (
                        <button
                          key={value}
                          type="button"
                          className={`hc-chip ${active ? "is-active" : ""}`}
                          aria-pressed={active}
                          role="checkbox"
                          onClick={() => toggleDraftAL(value)}
                        >
                          <span className="hc-dot" aria-hidden />
                          <span>{label}</span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      className={`hc-chip hc-none ${draftAL.length === 0 ? "is-active" : ""}`}
                      aria-pressed={draftAL.length === 0}
                      onClick={clearDraftAL}
                    >
                      없음
                    </button>
                  </div>
                </div>

                {/* 저장/취소 */}
                <div className="form-actions" style={{ marginTop: 16, display: "flex", gap: 8 }}>
                  <button type="button" className="btn-primary" onClick={saveEdit}>저장</button>
                  <button type="button" className="btn-outline" onClick={cancelEdit}>취소</button>
                </div>
              </>
            )}
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
                      <img
                        src={s.image}
                        alt={s.name}
                        onError={(e)=>{ e.currentTarget.style.visibility="hidden"; }}
                      />
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
