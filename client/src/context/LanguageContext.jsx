import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../translations/en.js';
import te from '../translations/te.js';
import hi from '../translations/hi.js';
import pa from '../translations/pa.js';

const dictionaries = { en, te, hi, pa };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [locale, setLocaleState] = useState(() => {
    return localStorage.getItem('veltrix_lang') || 'en';
  });

  const setLocale = (lang) => {
    if (dictionaries[lang]) {
      setLocaleState(lang);
      localStorage.setItem('veltrix_lang', lang);
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
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
