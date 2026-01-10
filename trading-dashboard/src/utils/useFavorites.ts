import { useState, useEffect } from 'react';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorite_symbols');
    const savedRecents = localStorage.getItem('recent_symbols');
    
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedRecents) setRecents(JSON.parse(savedRecents));
  }, []);

  const addFavorite = (symbol: string) => {
    const updated = [...new Set([symbol, ...favorites])].slice(0, 10);
    setFavorites(updated);
    localStorage.setItem('favorite_symbols', JSON.stringify(updated));
  };

  const removeFavorite = (symbol: string) => {
    const updated = favorites.filter(s => s !== symbol);
    setFavorites(updated);
    localStorage.setItem('favorite_symbols', JSON.stringify(updated));
  };

  const addRecent = (symbol: string) => {
    const updated = [symbol, ...recents.filter(s => s !== symbol)].slice(0, 5);
    setRecents(updated);
    localStorage.setItem('recent_symbols', JSON.stringify(updated));
  };

  const isFavorite = (symbol: string) => favorites.includes(symbol);

  return {
    favorites,
    recents,
    addFavorite,
    removeFavorite,
    addRecent,
    isFavorite
  };
};