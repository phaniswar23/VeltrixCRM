import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../translations/en.js';
import te from '../translations/te.js';
import hi from '../translations/hi.js';
import pa from '../translations/pa.js';

const dictionaries = { en, te, hi, pa };

export const AVAILABLE_LANGUAGES = [
  // 21 Indian Regional Languages
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', region: 'Regional' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', region: 'Regional' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', region: 'Regional' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', region: 'Regional' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം', region: 'Regional' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', region: 'Regional' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', region: 'Regional' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', region: 'Regional' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', region: 'Regional' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ', region: 'Regional' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া', region: 'Regional' },
  { code: 'ur', label: 'Urdu', native: 'اردو', region: 'Regional' },
  { code: 'sa', label: 'Sanskrit', native: 'संस्कृतम्', region: 'Regional' },
  { code: 'bho', label: 'Bhojpuri', native: 'भोजपुरी', region: 'Regional' },
  { code: 'mai', label: 'Maithili', native: 'मैथिली', region: 'Regional' },
  { code: 'gom', label: 'Konkani', native: 'कोंकणी', region: 'Regional' },
  { code: 'doi', label: 'Dogri', native: 'डोगरी', region: 'Regional' },
  { code: 'sd', label: 'Sindhi', native: 'سنڌي', region: 'Regional' },
  { code: 'ks', label: 'Kashmiri', native: 'کٲشُر', region: 'Regional' },
  { code: 'ne', label: 'Nepali', native: 'नेपाली', region: 'Regional' },
  { code: 'mni-Mtei', label: 'Manipuri', native: 'মৈতৈলোন্', region: 'Regional' },

  // Global Languages
  { code: 'en', label: 'English', native: 'English', region: 'Global' },
  { code: 'es', label: 'Spanish', native: 'Español', region: 'Global' },
  { code: 'fr', label: 'French', native: 'Français', region: 'Global' },
  { code: 'de', label: 'German', native: 'Deutsch', region: 'Global' },
  { code: 'ar', label: 'Arabic', native: 'العربية', region: 'Global' },
  { code: 'ru', label: 'Russian', native: 'Русский', region: 'Global' },
  { code: 'pt', label: 'Portuguese', native: 'Português', region: 'Global' },
  { code: 'ja', label: 'Japanese', native: '日本語', region: 'Global' },
  { code: 'zh-CN', label: 'Chinese', native: '简体中文', region: 'Global' },
];

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [locale, setLocaleState] = useState(() => {
    return localStorage.getItem('veltrix_lang') || 'en';
  });

  const setLocale = (langCode) => {
    setLocaleState(langCode);
    localStorage.setItem('veltrix_lang', langCode);

    if (langCode === 'en') {
      // Clear Google Translate cookies
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
      window.location.reload();
      return;
    }

    // Set Google Translate cookie
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname};`;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${window.location.hostname};`;

    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  };

  const t = (key, params = {}) => {
    const currentDict = dictionaries[locale] || dictionaries.en;
    let text = currentDict[key] || dictionaries.en[key] || key;

    // Replace :param or {param} placeholders
    if (params && typeof params === 'object') {
      Object.keys(params).forEach((paramKey) => {
        text = text.replace(new RegExp(`:${paramKey}`, 'g'), params[paramKey]);
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, languages: AVAILABLE_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
