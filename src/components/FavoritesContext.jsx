import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const FavoritesContext = createContext(null);
const KEY = "favSnacks";

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

  const api = useMemo(() => ({
    favorites,
    isFavorite: (id) => favorites.some(f => f.id === id),
    add: (item) => setFavorites(prev => prev.some(f => f.id === item.id) ? prev : [...prev, item]),
    remove: (id) => setFavorites(prev => prev.filter(f => f.id !== id)),
    toggle: (item) => setFavorites(prev =>
      prev.some(f => f.id === item.id) ? prev.filter(f => f.id !== item.id) : [...prev, item]
    ),
    clear: () => setFavorites([]),
  }), [favorites]);

  return <FavoritesContext.Provider value={api}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
