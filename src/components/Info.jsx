import React from "react";
import "./Info.css";
import { useFavorites } from "./FavoritesContext";
import { useSearchParams } from "react-router-dom"; // ✅ 추가

function HeartBtn({ on, ...rest }) {
  return (
    <button type="button" className={`fav-float ${on ? "on" : ""}`} {...rest} aria-label="찜하기/해제">
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path d="M12 21s-7.2-4.35-9.6-8.4C1 10 2.4 6.6 6 6.6c2 0 3.4 1.1 4 2.1.6-1 2-2.1 4-2.1 3.6 0 5 3.4 3.6 6-2.4 4.05-9.6 8.4-9.6 8.4Z"
          fill={on ? "#e53935" : "rgba(0,0,0,0)"} stroke={on ? "#e53935" : "#fff"} strokeWidth="1.6"/>
      </svg>
    </button>
  );
}

export default function Info() {
  const { isFavorite, toggle } = useFavorites();
  const [searchParams] = useSearchParams();              // ✅ 추가
  const targetName = searchParams.get("name") || "";     // ✅ 추가

  const snacks = [
    {
      id: 101,
      name: "오곡바",
      brand: "실버스낵",
      image: "/images/snack-example.png",
      badges: ["저당", "저염", "부드러움", "카페인없음"],
      category: "바",
      nutrition: { serving: "1회 제공량 (30g)", per100g: { calories: "450kcal", protein: "8g", fat: "20g", carbs: "60g", sugar: "5g", sodium: "120mg" } },
      allergens: ["우유", "대두", "밀"],
    },
    {
      id: 102,
      name: "고구마칩",
      brand: "헬시푸드",
      image: "/images/snack-sweetpotato.png",
      badges: ["저당", "글루텐프리"],
      category: "칩",
      nutrition: { serving: "1회 제공량 (25g)", per100g: { calories: "380kcal", protein: "4g", fat: "10g", carbs: "75g", sugar: "3g", sodium: "80mg" } },
      allergens: ["없음"],
    },
    // ✅ Find 목록과 이름 매칭되는 항목 추가
    {
      id: 103,
      name: "현미쿠키",
      brand: "그레인랩",
      image: "/images/snack-cookie.png",
      badges: ["저당"],
      category: "쿠키",
      nutrition: { serving: "1회 제공량 (30g)", per100g: { calories: "420kcal", protein: "6g", fat: "15g", carbs: "68g", sugar: "6g", sodium: "110mg" } },
      allergens: ["밀", "우유"],
    },
    {
      id: 104,
      name: "캐모마일티",
      brand: "허브하우스",
      image: "/images/snack-tea.png",
      badges: ["카페인없음","부드러움"],
      category: "음료",
      nutrition: { serving: "1회 제공량 (200ml)", per100g: { calories: "2kcal", protein: "0g", fat: "0g", carbs: "0g", sugar: "0g", sodium: "5mg" } },
      allergens: ["없음"],
    },
  ];

  // ✅ 쿼리 name이 있으면 해당 이름만, 없으면 전체
  const list = targetName
    ? snacks.filter((s) => s.name === targetName)
    : snacks;

  return (
    <div className="info-page">
      {list.length === 0 ? (
        <div className="info-empty">해당 제품 정보를 찾을 수 없습니다.</div>
      ) : (
        list.map((s) => (
          <div key={s.id} className="snack-section">
            <div className="info-header">
              <div className="img-wrap">
                <img src={s.image} alt={s.name} className="info-image" />
                <HeartBtn
                  on={isFavorite(s.id)}
                  onClick={() => toggle({ id: s.id, name: s.name, brand: s.brand, image: s.image, category: s.category })}
                />
              </div>
              <div className="info-basic">
                <h1 className="info-name">{s.name}</h1>
                <p className="info-brand">{s.brand}</p>
                <div className="badge-list">
                  {s.badges.map((b, i) => (<span key={i} className="badge">{b}</span>))}
                </div>
              </div>
            </div>

            <div className="section">
              <h2 className="section-title">영양정보</h2>
              <p className="serving">{s.nutrition.serving}</p>
              <table className="nutrition-table">
                <thead><tr><th>항목</th><th>100g 기준</th></tr></thead>
                <tbody>
                  <tr><td>열량</td><td>{s.nutrition.per100g.calories}</td></tr>
                  <tr><td>단백질</td><td>{s.nutrition.per100g.protein}</td></tr>
                  <tr><td>지방</td><td>{s.nutrition.per100g.fat}</td></tr>
                  <tr><td>탄수화물</td><td>{s.nutrition.per100g.carbs}</td></tr>
                  <tr><td>당류</td><td>{s.nutrition.per100g.sugar}</td></tr>
                  <tr><td>나트륨</td><td>{s.nutrition.per100g.sodium}</td></tr>
                </tbody>
              </table>
            </div>

            <div className="section">
              <h2 className="section-title">알레르겐</h2>
              <p className="allergens">{s.allergens.join(", ")}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
