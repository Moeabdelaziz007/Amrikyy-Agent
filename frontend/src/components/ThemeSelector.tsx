import React, { useContext } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../lib/i18n';
import { LanguageContext } from '../App';
import { Palette, Check } from 'lucide-react'; // Import icons
import { motion } from 'framer-motion'; // Import motion

interface ThemeSelectorProps {
  // Removed language prop, now using useContext(LanguageContext)
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = () => {
  const { theme, setTheme, availableThemes } = useTheme();
  const { lang } = useContext(LanguageContext); // Use lang from LanguageContext
  const currentThemeColors = theme.colors;

  const [isOpen, setIsOpen] = React.useState(false); // State to manage dropdown visibility

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2 rounded-lg border text-text bg-background hover:bg-opacity-80 transition-all`}
        style={{ background