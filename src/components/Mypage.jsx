// src/MyPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./MyPage.css";
import { useFavorites } from "./FavoritesContext";
import { useNavigate } from "react-router-dom";

const DEFAULT_API_BASE = "http://3.35.209.210:8080";
const API_BASE = import.meta.env.VITE_API_BASE || DEFAULT_API_BASE;

// Swagger 기준 엔드포인트
const USER_INFO_URL = `${API_BASE}/user/getInfo`;   // GET
const UPDATE_PROFILE_URL = `${API_BASE}/user/profile`; // PATCH

export default function MyPage() {
  const navigate = useNavigate();
  const { favorites, remove } = useFavorites();
  const [tab, setTab] = useState("profile");

  // 라벨/순서
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

  // 서버에서 받은 현재 상태
  const [profile, setProfile] = useState({ username: "", email: "" });
  const [healthConcerns, setHealthConcerns] = useState([]); // enum 코드 배열
  const [allergies, setAllergies] = useState([]);           // enum 코드 배열

  // 로딩/오류
  const [loadingUser, setLoadingUser] = useState(true);
  const [userFetchError, setUserFetchError] = useState("");

  // 저장(패치) 상태
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // 보기용 정렬
  const hcSorted = useMemo(
    () => healthConcerns.slice().sort((a, b) => HC_ORDER.indexOf(a) - HC_ORDER.indexOf(b)),
    [healthConcerns]
  );
  const alSorted = useMemo(
    () => allergies.slice().sort((a, b) => AL_ORDER.indexOf(a) - AL_ORDER.indexOf(b)),
    [allergies]
  );

  // 편집 모드
  const [editMode, setEditMode] = useState(false);
  const [draftProfile, setDraftProfile] = useState({ username: "", email: "" });
  const [draftHC, setDraftHC] = useState([]);
  const [draftAL, setDraftAL] = useState([]);

  // ----- 유틸 -----
  const arrEq = (a = [], b = []) => {
    if (a.length !== b.length) return false;
    const sa = [...a].sort().join("|");
    const sb = [...b].sort().join("|");
    return sa === sb;
  };

  // ----- 사용자 정보 조회 (GET /user/getInfo) -----
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login", { replace: true, state: { from: "/mypage" } });
      return;
    }

    (async () => {
      setLoadingUser(true);
      setUserFetchError("");
      try {
        const res = await fetch(USER_INFO_URL, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const text = await res.text();
        let json = null; try { json = text ? JSON.parse(text) : null; } catch {}

        if (res.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.setItem("is_authenticated", "false");
          navigate("/login", { replace: true, state: { from: "/mypage" } });
          return;
        }

        if (!res.ok || json?.success === false) {
          const msg = json?.message || json?.errorCode || `요청 실패 (HTTP ${res.status})`;
          setUserFetchError(msg);
        } else {
          const u = json?.result ?? json;
          setProfile(prev => ({ ...prev, username: u?.username ?? prev.username, email: u?.email ?? prev.email }));
          if (Array.isArray(u?.purposes)) setHealthConcerns(u.purposes);
          if (Array.isArray(u?.allergies)) setAllergies(u.allergies);

          // 홈/추천 등에 재사용하는 로컬 동기화
          if (u?.username) localStorage.setItem("signup_username", u.username);
          if (u?.email) localStorage.setItem("signup_email", u.email);
          localStorage.setItem("healthConcerns", JSON.stringify(u?.purposes ?? []));
          localStorage.setItem("allergies", JSON.stringify(u?.allergies ?? []));
        }
      } catch {
        setUserFetchError("네트워크/CORS 오류가 발생했습니다.");
      } finally {
        setLoadingUser(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- 편집 시작/취소 -----
  const startEdit = () => {
    setDraftProfile({ username: profile.username, email: profile.email });
    setDraftHC(healthConcerns);
    setDraftAL(allergies);
    setSaveMsg("");
    setEditMode(true);
  };
  const cancelEdit = () => {
    setEditMode(false);
    setSaveMsg("");
  };

/** PATCH /user/profile — 항상 value(코드)만 보내도록 정규화 */
const saveEdit = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) { navigate("/login", { replace: true, state: { from: "/mypage" } }); return; }

  // 1) 이름/이메일은 비어 있으면 현재값으로 채움
  const name  = (draftProfile?.username ?? "").trim() || (profile?.username ?? "");
  const email = (draftProfile?.email ?? "").trim()    || (profile?.email ?? "");
  if (!name || !email) { setSaveMsg("이름/이메일은 비워둘 수 없습니다."); return; }

  // 2) 선택 배열 원본(드래프트가 비었으면 기존 상태 사용)
  const hcSrc = (draftHC && draftHC.length ? draftHC : healthConcerns) || [];
  const alSrc = (draftAL && draftAL.length ? draftAL : allergies) || [];

  // 3) ✅ 라벨이 섞여 있어도 'value(코드)'로 변환
  const purposes = hcSrc
    .map(x => {
      const item = HEALTH_ITEMS.find(i => i.value === x || i.label === x);
      return item ? item.value : null; // 항상 코드만 남김
    })
    .filter(Boolean);

  const allergiesCodes = alSrc
    .map(x => {
      const item = ALLERGY_ITEMS.find(i => i.value === x || i.label === x);
      return item ? item.value : null; // 항상 코드만 남김
    })
    .filter(Boolean);

  const payload = { name, email, purposes, allergies: allergiesCodes };

  setSaving(true); setSaveMsg("");
  try {
    const res = await fetch(UPDATE_PROFILE_URL, {
      method: "PATCH",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let json = null; try { json = text ? JSON.parse(text) : null; } catch {}

    if (!res.ok || json?.success === false) {
      setSaveMsg(json?.message || json?.errorCode || `저장 실패 (HTTP ${res.status})`);
      if (res.status === 401) navigate("/login", { replace: true, state: { from: "/mypage" } });
      return;
    }

    // 성공 시 화면/로컬 스토리지 동기화 (코드 기준으로 저장)
    setProfile({ username: name, email });
    setHealthConcerns(purposes);
    setAllergies(allergiesCodes);
    localStorage.setItem("signup_username", name);
    localStorage.setItem("signup_email", email);
    localStorage.setItem("healthConcerns", JSON.stringify(purposes));
    localStorage.setItem("allergies", JSON.stringify(allergiesCodes));

    setEditMode(false);
    setSaveMsg("저장되었습니다.");
  } catch (err) {
    console.error("NETWORK/CORS error:", err);
    setSaveMsg("네트워크/CORS 오류로 저장하지 못했습니다.");
  } finally {
    setSaving(false);
  }
};


  // 칩 토글(편집)
  const toggleDraftHC = (val) => {
    setDraftHC(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };
  const toggleDraftAL = (val) => {
    setDraftAL(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };
  const clearDraftHC = () => setDraftHC([]);
  const clearDraftAL = () => setDraftAL([]);

  return (
    <div className="mypage">
      {/* 사이드바 */}
      <aside className="mp-sidebar">
        <div className="mp-user">
          <img className="mp-avatar" src="/images/avatar.png" alt="user" />
        <div><strong className="mp-name">{profile.username || "사용자"}</strong></div>
        </div>

        {/* 요약 뱃지 */}
        <div className="mp-brief">
          <div className="mp-brief-sec">
            <div className="mp-brief-title">건강상태</div>
            <div className="hc-chip-row" style={{ marginTop: 8 }}>
              {hcSorted.length ? hcSorted.map(v => (
                <span key={v} className="hc-chip is-active"><span className="hc-dot" /><span>{HC_LABELS[v] ?? v}</span></span>
              )) : <span className="hc-chip hc-none is-active">없음</span>}
            </div>
          </div>

          <div className="mp-brief-sec" style={{ marginTop: 12 }}>
            <div className="mp-brief-title">알레르기</div>
            <div className="hc-chip-row" style={{ marginTop: 8 }}>
              {alSorted.length ? alSorted.map(v => (
                <span key={v} className="hc-chip is-active"><span className="hc-dot" /><span>{AL_LABELS[v] ?? v}</span></span>
              )) : <span className="hc-chip hc-none is-active">없음</span>}
            </div>
          </div>
        </div>

        <nav className="mp-nav" style={{ marginTop: 16 }}>
          <button className={`mp-nav-item ${tab === "favs" ? "active" : ""}`} onClick={() => setTab("favs")}>찜한 간식</button>
          <button className={`mp-nav-item ${tab === "profile" ? "active" : ""}`} onClick={() => setTab("profile")}>회원 정보 수정</button>
        </nav>
      </aside>

      {/* 본문 */}
      <main className="mp-content">
        <header className="mp-header">
          <h1>내 실버푸드</h1>
          {loadingUser && <p className="mp-empty" style={{ margin: 0 }}>사용자 정보를 불러오는 중…</p>}
          {!loadingUser && userFetchError && <p className="error" style={{ margin: 0 }}>{userFetchError}</p>}
          {saveMsg && <p className="mp-empty" style={{ margin: 0 }}>{saveMsg}</p>}
        </header>

        {tab === "profile" && (
          <section className="mp-card">
            <h2 className="mp-subtitle" style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              건강 정보
              {!editMode ? (
                <button type="button" className="btn-outline" onClick={startEdit}>회원정보 편집</button>
              ) : <span />}
            </h2>

            {/* 보기 모드 */}
            {!editMode && (
              <>
                <div className="hc-section">
                  <div className="hc-head"><div className="label">이름 / 이메일</div></div>
                  <div className="hc-chip-row" style={{ gap: 10 }}>
                    <span className="hc-chip is-active"><span>{profile.username || "-"}</span></span>
                    <span className="hc-chip is-active"><span>{profile.email || "-"}</span></span>
                  </div>
                </div>

                <div className="hc-section" style={{ marginTop: 12 }}>
                  <div className="hc-head"><div className="label">건강상태</div></div>
                  <div className="hc-chip-row">
                    {hcSorted.length ? hcSorted.map(v => (
                      <span key={v} className="hc-chip is-active"><span className="hc-dot" /><span>{HC_LABELS[v] ?? v}</span></span>
                    )) : <span className="hc-chip hc-none is-active">없음</span>}
                  </div>
                </div>

                <div className="hc-section" style={{ marginTop: 12 }}>
                  <div className="hc-head"><div className="label">알레르기</div></div>
                  <div className="hc-chip-row">
                    {alSorted.length ? alSorted.map(v => (
                      <span key={v} className="hc-chip is-active"><span className="hc-dot" /><span>{AL_LABELS[v] ?? v}</span></span>
                    )) : <span className="hc-chip hc-none is-active">없음</span>}
                  </div>
                </div>
              </>
            )}

            {/* 편집 모드 */}
            {editMode && (
              <>
                <form className="mp-form" style={{ marginTop: 12 }} onSubmit={(e)=>e.preventDefault()}>
                  <div className="field">
                    <label>이름</label>
                    <input
                      type="text"
                      value={draftProfile.username}
                      onChange={(e)=>setDraftProfile(p=>({ ...p, username: e.target.value }))}
                    />
                  </div>
                  <div className="field">
                    <label>이메일</label>
                    <input
                      type="email"
                      value={draftProfile.email}
                      onChange={(e)=>setDraftProfile(p=>({ ...p, email: e.target.value }))}
                    />
                  </div>
                </form>

                <div className="hc-section" style={{ marginTop: 6 }}>
                  <div className="hc-head"><div className="label">건강상태 (다중 선택)</div></div>
                  <div className="hc-chip-row" role="group" aria-label="정보 수정">
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
                  <div className="hc-head"><div className="label">알레르기 (다중 선택)</div></div>
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

                <div className="form-actions" style={{ marginTop: 16, display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={saveEdit}
                    disabled={saving}
                  >
                    {saving ? "저장 중..." : "저장"}
                  </button>
                  <button type="button" className="btn-outline" onClick={cancelEdit} disabled={saving}>취소</button>
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
                      <img src={s.image} alt={s.name} onError={(e)=>{ e.currentTarget.style.visibility="hidden"; }} />
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
