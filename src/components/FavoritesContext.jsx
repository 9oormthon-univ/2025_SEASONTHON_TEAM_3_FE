// FavoritesContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const FavoritesContext = createContext(null);
const KEY = "favSnacks"; // 선택: 로컬 캐시 유지하고 싶으면 둠

const DEFAULT_API_BASE = "http://3.35.209.210:8080";
const API_BASE = import.meta.env.VITE_API_BASE || DEFAULT_API_BASE;

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  // 로컬 캐시 저장 (서버에서 받은 정식 데이터 전체를 그대로 캐시)
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(favorites)); } catch {}
  }, [favorites]);

  /** 서버에서 찜 목록 다시 가져오기 (정식 스키마 포함) */
  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(`${API_BASE}/likes/snacks`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const text = await res.text();
      let json = null; try { json = text ? JSON.parse(text) : null; } catch {}

      if (!res.ok || json?.success === false) {
        console.error("찜 목록 조회 실패:", res.status, text);
        return;
      }

      const list = Array.isArray(json?.result) ? json.result : [];
      // 서버 형식 가정: [{ snackId, name, manufacturer, snackCategory, imageUrl, ... }]
      setFavorites(list);
    } catch (err) {
      console.error("찜 목록 조회 실패:", err);
    }
  };

  /** 진입 시 1회 서버 동기화 */
  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 찜 토글 */
  const toggleLike = async (snackId) => {
    const id = Number(snackId);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("로그인이 필요합니다.");
      return;
    }

    // 낙관적 업데이트(최소): 화면 반응 먼저
    const isFav = favorites.some(f => (f.snackId ?? f.id) === id);
    setFavorites(prev =>
      isFav ? prev.filter(f => (f.snackId ?? f.id) !== id)
            : [...prev, { snackId: id }] // 임시; 곧 서버값으로 덮어씀
    );

    try {
      const res = await fetch(`${API_BASE}/likes/snacks/${id}`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const text = await res.text();
      let json = null; try { json = text ? JSON.parse(text) : null; } catch {}

      if (!res.ok || json?.success === false) {
        console.error("찜 토글 실패:", res.status, text);
        // 실패 시 원상복구
        setFavorites(prev =>
          isFav ? [...prev, { snackId: id }] : prev.filter(f => (f.snackId ?? f.id) !== id)
        );
        return;
      }

      // ✅ 성공 시 서버 데이터로 동기화 (정식 필드 채워짐)
      await fetchFavorites();
    } catch (err) {
      console.error("찜 토글 네트워크 오류:", err);
      // 실패 시 원상복구
      setFavorites(prev =>
        isFav ? [...prev, { snackId: id }] : prev.filter(f => (f.snackId ?? f.id) !== id)
      );
    }
  };

  /** 마이페이지의 '삭제' 버튼도 서버와 동기화되도록 */
  const remove = async (snackId) => {
    // 서버가 POST 토글 방식이면 같은 엔드포인트 사용
    await toggleLike(snackId);
  };

  const api = useMemo(() => ({
    favorites,
    isFavorite: (id) => favorites.some(f => (f.snackId ?? f.id) === Number(id)),
    toggle: toggleLike,
    remove,
    clear: () => setFavorites([]),
    fetchFavorites,
  }), [favorites]);

  return (
    <FavoritesContext.Provider value={api}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
