import { useState, createContext, FunctionComponent } from "react";

export interface Language {
  code: string;
  bcp47: string;
  nativeName: string;
  loc: Record<string, any>;
}

export function useLanguage(i18n: Record<string, any>) {
  const initLanguage = loadLanguage(i18n);
  const [language, setLanguage] = useState(initLanguage);

  function changeLanguage(languageCode: string) {
    if (!i18n[languageCode]) {
      languageCode = "en";
    }

    const newLanguage = i18n[languageCode];

    // Save to storage
    localStorage.setItem("pageLanguage", languageCode);
    // Update page
    document.documentElement.lang = newLanguage.bcp47;
    document.title = newLanguage.loc.title;
    // Update state
    setLanguage(newLanguage);
  }

  return [language, changeLanguage];
}

function loadLanguage(i18n: Record<string, any>) {
  // Grab the page language
  let savedLang = localStorage.getItem("pageLanguage");
  // If no saved language or language is not found, try to match navigator language
  const langMatch = [];
  if (!savedLang || !i18n[savedLang]) {
    // Check all possible languages
    const navLang = navigator.language.toLowerCase();
    for (let k in i18n) {
      const bcp47 = i18n[k].bcp47.toLowerCase();
      // If we get a match break out
      if (bcp47 === navLang) {
        savedLang = k;
        break;
        // If language is the same we save it fist
      } else if (bcp47.split("-")[0] === navLang.split("-")[0]) {
        langMatch.push(k);
      }
    }
  }

  if (!savedLang) {
    savedLang = "en";
  }
  // If we didn't get exact match, try language match, otherwise default to english
  else if (!i18n[savedLang]) {
    if (langMatch.length > 0) {
      savedLang = langMatch[0];
    } else {
      savedLang = "en";
    }
  }

  const language = i18n[savedLang];

  if (language.bcp47) {
    document.documentElement.lang = language.bcp47;
  }

  if (language.loc && language.loc.title) {
    document.title = language.loc.title;
  }

  return language;
}

interface LanguageSelectProps {
  i18n: Record<string, any>;
  language: Record<string, any>;
  changeLanguage: (language: string) => void;
}

export const LanguageSelect: FunctionComponent<LanguageSelectProps> = ({
  i18n,
  language,
  changeLanguage,
}) => {
  return (
    <select
      onChange={(e) => changeLanguage(e.target.value)}
      value={language ? language.code : ""}
      className="language-select"
      aria-label="language select"
    >
      {Object.keys(i18n).map((k) => (
        <option value={k} key={`option-${k}`}>
          {i18n[k].nativeName}
        </option>
      ))}
    </select>
  );
};

export const LanguageContext = createContext<Language>({
  code: "en",
  bcp47: "en-US",
  nativeName: "English",
  loc: {},
});
