import { useContext } from 'react';
import { LanguageContext, LanguageSelect } from '../context/language-context';
import i18n from '../data/i18n.json'
import metadata from '../data/metadata.json';

export default function Footer({ changeLanguage }) {

  const language = useContext(LanguageContext);

  return (
    <footer>
      {language.loc.footer.disclaimer}
      <br />
      <LanguageSelect i18n={i18n} language={language} changeLanguage={changeLanguage}/>
      <a href='https://ko-fi.com/N4N34N2U2' target='_blank' rel='noreferrer'>
        <img
          height='36'
          style={{
            border: '0px',
            height: '24px',
            verticalAlign: 'middle'
          }}
          src='https://cdn.ko-fi.com/cdn/kofi1.png?v=2'
          alt='Buy Me a Coffee at ko-fi.com'
        />
      </a>
      <br />
      <a href='https://github.com/chaosspam/dl-dialogue-generator-react'> Github </a> / {`v${metadata.buildMajor}.${metadata.buildMinor}.${metadata.buildRevision}`}
    </footer>
  );
}