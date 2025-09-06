import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const FavoritesContext = createContext(null);
const KEY = "favSnacks";

// API 엔드포인트
const DEFAULT_API_BASE = "http://3.35.209.210:8080";
const API_BASE = import.meta.env.VITE_API_BASE || DEFAULT_API_BASE;

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(favorites)); } catch {}
  }, [favorites]);

  // 찜한 간식 목록을 서버에서 가져오는 함수
  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('로그인이 필요합니다.');
        return;
      }

      const response = await fetch(`${API_BASE}/likes/snacks`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`찜한 간식 조회 실패: ${response.status}`, errorText);
        return;
      }

      const data = await response.json();
      
      if (data.success && data.result) {
        setFavorites(data.result);
      }
    } catch (err) {
      console.error('찜한 간식 조회 실패:', err);
    }
  };

  // 백엔드 API를 호출하는 toggle 함수
  const toggleLike = async (snackId) => {
    const numSnackId = Number(snackId);
    const isCurrentlyFavorite = favorites.some(f => f.snackId === numSnackId);
    
    // 1. 먼저 로컬 상태를 즉시 업데이트 (낙관적 업데이트)
    setFavorites(prev => {
      if (isCurrentlyFavorite) {
        // 찜 해제
        return prev.filter(f => f.snackId !== numSnackId);
      } else {
        // 찜하기
        return [...prev, { snackId: numSnackId }];
      }
    });

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('로그인이 필요합니다.');
        return;
      }

      const response = await fetch(`${API_BASE}/likes/snacks/${snackId}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API 호출 실패: ${response.status}`, errorText);
        // API 실패 시 원래 상태로 되돌리기
        setFavorites(prev => {
          if (isCurrentlyFavorite) {
            return [...prev, { snackId: numSnackId }];
          } else {
            return prev.filter(f => f.snackId !== numSnackId);
          }
        });
        return;
      }

      const data = await response.json();
      
      if (data.success && data.result) {
        console.log('찜하기 토글 성공:', data.result);
      }
    } catch (err) {
      console.error('찜하기 토글 실패:', err);
      // 네트워크 오류 시 원래 상태로 되돌리기
      setFavorites(prev => {
        if (isCurrentlyFavorite) {
          return [...prev, { snackId: numSnackId }];
        } else {
          return prev.filter(f => f.snackId !== numSnackId);
        }
      });
    }
  };

  const api = useMemo(() => ({
    favorites,
    isFavorite: (id) => favorites.some(f => f.snackId === Number(id)),
    add: (item) => setFavorites(prev => prev.some(f => f.snackId === item.snackId) ? prev : [...prev, item]),
    remove: (id) => setFavorites(prev => prev.filter(f => f.snackId !== Number(id))),
    toggle: toggleLike,
    clear: () => setFavorites([]),
    fetchFavorites,
  }), [favorites]);

  return <FavoritesContext.Provider value={api}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
