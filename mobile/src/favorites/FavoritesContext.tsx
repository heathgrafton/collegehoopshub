import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "collegehoopshub:favorites:v1";
const ONBOARDED_KEY = "collegehoopshub:onboarded:v1";

type FavoritesState = {
  teamIds: string[];
  playerIds: string[];
};

type FavoritesContextValue = {
  isReady: boolean;
  hasOnboarded: boolean;
  favoriteTeamIds: string[];
  favoritePlayerIds: string[];
  isFavoriteTeam: (id: string) => boolean;
  isFavoritePlayer: (id: string) => boolean;
  toggleFavoriteTeam: (id: string) => void;
  toggleFavoritePlayer: (id: string) => void;
  completeOnboarding: (initialTeamIds: string[]) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [state, setState] = useState<FavoritesState>({ teamIds: [], playerIds: [] });

  useEffect(() => {
    (async () => {
      try {
        const [storedFavorites, storedOnboarded] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(ONBOARDED_KEY),
        ]);
        if (storedFavorites) setState(JSON.parse(storedFavorites));
        setHasOnboarded(storedOnboarded === "true");
      } catch {
        // Storage unavailable (e.g. private browsing) — proceed with defaults rather than blocking the app.
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  function persist(next: FavoritesState) {
    setState(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }

  function toggleFavoriteTeam(id: string) {
    persist({
      ...state,
      teamIds: state.teamIds.includes(id) ? state.teamIds.filter((t) => t !== id) : [...state.teamIds, id],
    });
  }

  function toggleFavoritePlayer(id: string) {
    persist({
      ...state,
      playerIds: state.playerIds.includes(id) ? state.playerIds.filter((p) => p !== id) : [...state.playerIds, id],
    });
  }

  function completeOnboarding(initialTeamIds: string[]) {
    persist({ ...state, teamIds: initialTeamIds });
    setHasOnboarded(true);
    AsyncStorage.setItem(ONBOARDED_KEY, "true").catch(() => {});
  }

  const value = useMemo<FavoritesContextValue>(
    () => ({
      isReady,
      hasOnboarded,
      favoriteTeamIds: state.teamIds,
      favoritePlayerIds: state.playerIds,
      isFavoriteTeam: (id) => state.teamIds.includes(id),
      isFavoritePlayer: (id) => state.playerIds.includes(id),
      toggleFavoriteTeam,
      toggleFavoritePlayer,
      completeOnboarding,
    }),
    [isReady, hasOnboarded, state]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within a FavoritesProvider");
  return ctx;
}
