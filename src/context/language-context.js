import { useState, createContext } from 'react';

export function useLanguage(i18n) {
  const initLanguage = loadLanguage(i18n);
  const [language, setLanguage] = useState(initLanguage);

  function changeLanguage(languageCode) {
    if (!i18n[languageCode]) {
      languageCode = 'en';
    }

    const newLanguage = i18n[languageCode];

    // Save to storage
    localStorage.setItem('pageLanguage', languageCode);
    // Update page
    document.documentElement.lang = newLanguage.bcp47;
    document.title = newLanguage.loc.title;
    // Update state
    setLanguage(newLanguage);
  }

  return [language, changeLanguage];
}

function loadLanguage(i18n) {
  // Grab the page language
  let savedLang = localStorage.getItem('pageLanguage');
  // If no saved language or language is not found, try to match navigator language
  const langMatch = [];
  if (!savedLang || !i18n[savedLang]) {
    // Check all possible languages
    const navLang = navigator.language.toLowerCase();
    for(let k in i18n) {
      const bcp47 = i18n[k].bcp47.toLowerCase();
      // If we get a match break out
      if(bcp47 === navLang) {
        savedLang = k;
        break;
      // If language is the same we save it fist
      } else if (bcp47.split('-')[0] === navLang.split('-')[0]) {
        langMatch.push(k);
      }
    }
  }
  // If we didn't get exact match, try language match, otherwise default to english
  if (!i18n[savedLang]) {
    if(langMatch.length > 0) {
      savedLang = langMatch[0];
    } else {
      savedLang = 'en';
    }
  }

  const language = i18n[savedLang];

  if(language.bcp47) {
    document.documentElement.lang = language.bcp47;
  }

  if(language.loc && language.loc.title) {
    document.title = language.loc.title;
  }

  return language;
}

export function LanguageSelect({ i18n, language, changeLanguage }) {
  return (
    <select
      onChange={e => changeLanguage(e.target.value)}
      value={language ? language.code : ''}
      className='language-select'
      aria-label='language select'
    >
      {Object.keys(i18n).map(k => <option value={k} key={`option-${k}`}>{i18n[k].nativeName}</option>)}
    </select>
  );
}

export const LanguageContext = createContext({});