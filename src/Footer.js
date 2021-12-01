import i18n from './data/i18n.json'

function Footer(props) {
  const { pageLang, setLanguage } = props;
  return (
    <footer>
      {
        pageLang === 'en' ?
          <iframe
            title='Steam Widget'
            src='https://store.steampowered.com/widget/1764410/'
            frameBorder='0'
            height='190'
            style={{
              width: '100%',
              maxWidth: '646px'
            }}
          /> : null
      }
      {
        pageLang === 'en' ?
          <p>(Sorry for the shameless self promotion)</p> : null
      }
      {i18n[pageLang].loc.footer.disclaimer} /
      <a href='https://github.com/chaosspam/DLDialogueScreenGenerator'> Github </a>
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

export default Footer;