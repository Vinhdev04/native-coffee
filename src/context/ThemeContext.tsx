/**
 * @file ThemeContext.tsx
 * @desc Global dark/light mode context.
 *       - `colors` được memoize một lần trong Provider → không tính lại mỗi render
 *       - Tất cả screens chỉ cần: const { colors, isDark } = useTheme();
 */

import React, {
  createContext, useContext, useState, useEffect, useMemo, ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@app_theme';
type ThemeMode = 'dark' | 'light';

// ─── Palette ─────────────────────────────────────────────────────────────────
const buildColors = (isDark: boolean) => ({
  // Backgrounds
  bg:              isDark ? '#0A0F1E' : '#F8FAFC',
  bgSecondary:     isDark ? '#0D1322' : '#F1F5F9',
  surface:         isDark ? '#131929' : '#FFFFFF',
  card:            isDark ? '#1A2235' : '#FFFFFF',
  cardAlt:         isDark ? '#111827' : '#F9FAFB',

  // Text
  text:            isDark ? '#F8FAFC' : '#111827',
  textSub:         isDark ? '#94A3B8' : '#6B7280',
  textMuted:       isDark ? '#475569' : '#9CA3AF',
  textOnPrimary:   '#FFFFFF',

  // Borders
  border:          isDark ? 'rgba(255,255,255,0.07)' : '#E5E7EB',
  borderLight:     isDark ? 'rgba(255,255,255,0.04)' : '#F3F4F6',
  divider:         isDark ? 'rgba(255,255,255,0.06)' : '#F0F0F0',

  // Bottom Tab
  tabBar:          isDark ? '#0D1322' : '#FFFFFF',
  tabBorder:       isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6',
  tabActive:       '#FF7A00',
  tabInactive:     isDark ? '#475569' : '#9CA3AF',
  tabIconActiveBg: isDark ? 'rgba(255,122,0,0.12)' : '#FFF7ED',

  // Header
  headerBg:        isDark ? '#0A0F1E' : '#FFFFFF',
  headerBorder:    isDark ? 'rgba(255,255,255,0.05)' : '#F0F0F0',
  statusBar:       isDark ? 'light-content' : 'dark-content',

  // Inputs
  searchBg:        isDark ? '#131929' : '#F3F4F6',
  searchBorder:    isDark ? 'rgba(255,255,255,0.07)' : '#E5E7EB',
  inputText:       isDark ? '#F8FAFC' : '#111827',
  placeholder:     isDark ? '#475569' : '#9CA3AF',

  // Category chips
  chipBg:          isDark ? '#1A2235' : '#F3F4F6',
  chipBgActive:    '#FF7A00',
  chipText:        isDark ? '#94A3B8' : '#6B7280',
  chipTextActive:  '#FFFFFF',

  // Section headers
  sectionBg:       isDark ? '#0D1322' : '#F7F7F8',
  sectionTitle:    isDark ? '#94A3B8' : '#374151',

  // Primary
  primary:         '#FF7A00',
  primaryLight:    isDark ? 'rgba(255,122,0,0.15)' : 'rgba(255,122,0,0.08)',
  primaryBorder:   'rgba(255,122,0,0.25)',

  // Semantic
  success:         '#10B981',
  successLight:    'rgba(16,185,129,0.12)',
  error:           '#EF4444',
  errorLight:      'rgba(239,68,68,0.12)',
  warning:         '#F59E0B',
  info:            '#818CF8',
  infoLight:       'rgba(129,140,248,0.15)',

  // Overlay
  overlay:         'rgba(0,0,0,0.65)',
  overlayLight:    'rgba(0,0,0,0.35)',

  // Modal / BottomSheet
  modalBg:         isDark ? '#111827' : '#FFFFFF',
  modalBorder:     isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
  dragHandle:      isDark ? 'rgba(255,255,255,0.15)' : '#D1D5DB',

  // Buttons
  btnCancel:       isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6',
  btnCancelText:   isDark ? '#94A3B8' : '#374151',
});

export type ThemeColors = ReturnType<typeof buildColors>;

// ─── Context ─────────────────────────────────────────────────────────────────
interface ThemeCtx {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeCtx>({
  isDark: true,
  colors: buildColors(true),
  toggleTheme: () => {},
});

// ─── Provider ────────────────────────────────────────────────────────────────
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(true);

  // Load saved preference once on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(v => {
      if (v === 'light') setIsDark(false);
      if (v === 'dark')  setIsDark(true);
    });
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
      return next;
    });
  };

  // colors is memoized — rebuilt ONLY when isDark changes
  const colors = useMemo(() => buildColors(isDark), [isDark]);

  const value = useMemo<ThemeCtx>(
    () => ({ isDark, colors, toggleTheme }),
    [isDark, colors],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// ─── Hook ────────────────────────────────────────────────────────────────────
export const useTheme = () => useContext(ThemeContext);

/** @deprecated use useTheme().colors instead */
export const getThemeColors = buildColors;
