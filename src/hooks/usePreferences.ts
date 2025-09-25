import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './useAuth';
import { UserPreferences } from '../types';

export const usePreferences = () => {
  const { supabaseUser } = useAuth();
  const { i18n } = useTranslation();

  useEffect(() => {
    const preferences: UserPreferences = supabaseUser?.user_metadata?.preferences as UserPreferences || {
      language: 'en',
      theme: 'light',
      dyslexic_font: false,
      high_contrast: false,
      reduced_motion: false,
      text_size: 'medium',
      voice_enabled: true,
    };

    // Language
    if (preferences.language && preferences.language !== i18n.language) {
      i18n.changeLanguage(preferences.language);
    }

    const html = document.documentElement;

    // Theme
    if (preferences.theme === 'dark') {
      html.classList.add('dark');
    } else if (preferences.theme === 'light') {
      html.classList.remove('dark');
    } else { // auto
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const updateTheme = () => {
        if (mediaQuery.matches) {
          html.classList.add('dark');
        } else {
          html.classList.remove('dark');
        }
      };
      updateTheme();
      const listener = () => updateTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }

    // Text size
    let baseFontSize = '1rem';
    switch (preferences.text_size) {
      case 'small':
        baseFontSize = '0.875rem';
        break;
      case 'medium':
        baseFontSize = '1rem';
        break;
      case 'large':
        baseFontSize = '1.125rem';
        break;
    }
    html.style.setProperty('--font-size-base', baseFontSize);

    // Dyslexic font
    if (preferences.dyslexic_font) {
      html.classList.add('dyslexic-font');
    } else {
      html.classList.remove('dyslexic-font');
    }

    // High contrast
    if (preferences.high_contrast) {
      html.classList.add('high-contrast');
    } else {
      html.classList.remove('high-contrast');
    }

    // Reduced motion
    if (preferences.reduced_motion) {
      html.classList.add('reduced-motion');
    } else {
      html.classList.remove('reduced-motion');
    }

    // Voice enabled (for future TTS)
    html.style.setProperty('--voice-enabled', preferences.voice_enabled ? 'true' : 'false');

  }, [supabaseUser, i18n]);
};
