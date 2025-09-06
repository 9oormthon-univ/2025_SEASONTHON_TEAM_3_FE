// src/Info.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./Info.css";
import Loading from "./Loading";

// 백엔드 베이스 URL
const API_BASE =
  (import.meta.env.VITE_API_BASE && import.meta.env.VITE_API_BASE.trim()) ||
  (location.hostname === "localhost" ? "http://3.35.209.210:8080" : "");

export default function Info() {
  const [sp] = useSearchParams();
  const idParam = sp.get("id");
  const snackId = idParam && /^\d+$/.test(idParam) ? idParam : null;

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [snack, setSnack] = useState(null);

  useEffect(() => {
    if (!snackId) {
      setErr("잘못된 요청입니다. (id 누락)");
      return;
    }

    const url = `${API_BASE}/api/snacks/${snackId}`;
    setLoading(true);
    setErr("");
    setSnack(null);

    fetch(url)
      .then(async (res) => {
        const text = await res.text();
        let json = null;
        try { json = text ? JSON.parse(text) : null; } catch {}
        if (!res.ok) {
          throw new Error(json?.message || json?.errorCode || `상세 조회 실패 (HTTP ${res.status})`);
        }
        if (json && "success" in json && json.success === false) {
          throw new Error(json?.message || json?.errorCode || "상세 조회 실패");
        }
        const data = json?.result || json;

        setSnack({
          id: Number(snackId),
          name: data?.name || "-",
          brand: data?.manufacturer || "-",
          category: data?.snackCategory || "-",
          image: data?.imageUrl || "/images/silver-snack-logo.png",
          hashtags: Array.isArray(data?.hashtags) ? data.hashtags : [],
          servingSize: data?.servingSize || "",
          foodWeight: data?.foodWeight || "",
          foodCode: data?.foodCode || "",

          energyKcal: data?.energyKcal,
          proteinG: data?.proteinG,
          fatG: data?.fatG,
          carbohydrateG: data?.carbohydrateG,
          sugarG: data?.sugarG,
          dietaryFiberG: data?.dietaryFiberG,
          sodiumMg: data?.sodiumMg,
          calciumMg: data?.calciumMg,
          potassiumMg: data?.potassiumMg,
          ironMg: data?.ironMg,
          vitaminARAEUg: data?.vitaminARAEUg,
          vitaminCMg: data?.vitaminCMg,
          cholesterolMg: data?.cholesterolMg,
          saturatedFatG: data?.saturatedFatG,
          transFatG: data?.transFatG,
        });
      })
      .catch((e) => setErr(e.message || "상세 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [snackId]);

  const onImgError = (e) => {
    const img = e.currentTarget;
    if (img.dataset.fallback === "1") return;
    img.dataset.fallback = "1";
    img.src = "/images/silver-snack-logo.png";
    img.style.objectFit = "contain";
    img.style.padding = "16px";
    img.style.background = "#fff";
  };

  const nutri = useMemo(() => {
    if (!snack) return [];
    const rows = [
      ["에너지(kcal)", snack.energyKcal],
      ["단백질(g)", snack.proteinG],
      ["지방(g)", snack.fatG],
      ["탄수화물(g)", snack.carbohydrateG],
      ["당류(g)", snack.sugarG],
      ["식이섬유(g)", snack.dietaryFiberG],
      ["나트륨(mg)", snack.sodiumMg],
      ["칼슘(mg)", snack.calciumMg],
      ["칼륨(mg)", snack.potassiumMg],
      ["철(mg)", snack.ironMg],
      ["비타민A(µg RAE)", snack.vitaminARAEUg],
      ["비타민C(mg)", snack.vitaminCMg],
      ["콜레스테롤(mg)", snack.cholesterolMg],
      ["포화지방(g)", snack.saturatedFatG],
      ["트랜스지방(g)", snack.transFatG],
    ];
    return rows.filter(([, v]) => v !== undefined && v !== null);
  }, [snack]);

  // 상태별 화면
  if (!snackId) {
    return (
      <main className="info-page">
        <div className="info-empty">잘못된 접근입니다. (id가 필요합니다)</div>
      </main>
    );
  }
  if (loading) {
    return (
      <main className="info-page">
        <Loading variant="dots" text="상세 정보를 불러오는 중..." />
      </main>
    );
  }
  if (err) {
    return (
      <main className="info-page">
        <div className="info-empty">{err}</div>
      </main>
    );
  }
  if (!snack) return null;

  return (
    <main className="info-page">
      <section className="snack-section">
        {/* 헤더 */}
        <div className="info-header">
          <div className="img-wrap">
            <img
              className="info-image"
              src={snack.image}
              alt={snack.name}
              onError={onImgError}
            />
          </div>
          <div className="info-basic">
            <h1 className="info-name">{snack.name}</h1>
            <p className="info-brand">{snack.brand}</p>

            {/* 해시태그 */}
            {snack.hashtags?.length > 0 && (
              <div className="badge-list">
                {snack.hashtags.map((t) => (
                  <span key={t} className="badge">#{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 영양 정보 섹션 */}
        <div className="section">
          <h2 className="section-title">영양 정보</h2>
          {nutri.length > 0 ? (
            <table className="nutrition-table" aria-label="영양 성분표">
              <tbody>
                {nutri.map(([label, value]) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="info-empty">제공된 영양 정보가 없습니다.</div>
          )}
        </div>
            {/* 메타 배지 */}
            <h2 className="section-title">추가 정보</h2>
            <div className="add-box">
              <div className="meta-lines">
                {snack.servingSize && <span className="meta-line">1회 제공량 {snack.servingSize}</span>}
                {snack.foodWeight &&  <span className="meta-line">중량 {snack.foodWeight}</span>}
                {snack.foodCode &&    <span className="meta-line">식품코드 {snack.foodCode}</span>}
              </div>
            </div>
      </section>
    </main>
  );
}
