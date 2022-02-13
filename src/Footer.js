import i18n from './data/i18n.json'
import metadata from './data/metadata.json';

export default function Footer({ pageLang, setLanguage }) {
  return (
    <footer>
      {
        pageLang === 'en' &&
        <>
          <iframe
            title='Steam Widget'
            src='https://store.steampowered.com/widget/1764410/'
            frameBorder='0'
            height='190'
            style={{
              width: '100%',
              maxWidth: '646px'
            }}
          />
          <p>(Sorry for the shameless self promotion)</p>
        </>
      }
      {i18n[pageLang].loc.footer.disclaimer} /
      <a href='https://github.com/chaosspam/dl-dialogue-generator-react'> Github </a> / {`v${metadata.buildMajor}.${metadata.buildMinor}.${metadata.buildRevision}`}
      <br />
      <select onChange={(e) => setLanguage(e.target.value)} defaultValue={pageLang} className='language-select'>
        <option value='en'>English</option>
        <option value='ja'>日本語</option>
        <option value='zh_tw'>繁體中文</option>
        <option value='zh_cn'>简体中文</option>
      </select>
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
    </footer>
  );
}