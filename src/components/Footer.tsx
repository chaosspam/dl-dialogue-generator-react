import "./Footer.scss";

import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FunctionComponent, useContext } from "react";
import { LanguageContext, LanguageSelect } from "../context/language-context";
import i18n from "../data/i18n.json";
import metadata from "../data/metadata.json";

const Footer: FunctionComponent<{
  changeLanguage: (language: string) => void;
}> = ({ changeLanguage }) => {
  const language = useContext(LanguageContext);

  return (
    <footer className="footer">
      <LanguageSelect
        i18n={i18n}
        language={language}
        changeLanguage={changeLanguage}
      />
      <a href="https://ko-fi.com/N4N34N2U2" target="_blank" rel="noreferrer">
        <img
          width="95"
          height="24"
          style={{
            border: "0px",
            height: "24px",
            width: "95px",
            verticalAlign: "middle",
          }}
          src="https://cdn.ko-fi.com/cdn/kofi1.png?v=2"
          alt="Buy Me a Coffee at ko-fi.com"
        />
      </a>
      <br />
      <div className="footer__other-info">
        <a
          href="https://github.com/chaosspam/dl-dialogue-generator-react"
          title="Github"
        >
          <FontAwesomeIcon icon={faGithub} />
          <span className="sr-only">Github</span>
        </a>
        &nbsp;/&nbsp;
        {`v${metadata.buildMajor}.${metadata.buildMinor}.${metadata.buildRevision}`}
      </div>
      <p className="footer__disclaimer">{language.loc.footer.disclaimer}</p>
    </footer>
  );
};

export default Footer;
