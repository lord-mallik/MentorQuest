import React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface LanguageSelectorProps {
  isMobile?: boolean;
  onLanguageChange?: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  isMobile = false, 
  onLanguageChange 
}) => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (language: string) => {
    try {
      i18n.changeLanguage(language);
      toast.success(`Language changed to ${language.toUpperCase()}`, {position: 'bottom-right'});
      onLanguageChange?.();
    } catch (error) {
      console.error('Error changing language:', error);
      toast.error('Failed to change language');
    }
  };

  if (isMobile) {
    return (
      <div className="px-3 py-2">
        <label className="block text-xs font-medium text-gray-700 mb-1">Language</label>
        <select
          value={i18n.language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="hi">हिन्दी</option>
        </select>
      </div>
    );
  }

  return (
    <select
      value={i18n.language}
      onChange={(e) => handleLanguageChange(e.target.value)}
      className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      <option value="en">EN</option>
      <option value="es">ES</option>
      <option value="fr">FR</option>
      <option value="de">DE</option>
      <option value="hi">हि</option>
    </select>
  );
};

export default LanguageSelector;