import { FunctionComponent, useContext } from "react";
import { LanguageContext } from "../context/language-context";
import "./LayerDeletePrompt.scss";

interface LayerDeletePromptProps {
  active: boolean;
  removeLayer: () => void;
  closePrompt: () => void;
}

const LayerDeletePrompt: FunctionComponent<LayerDeletePromptProps> = ({
  active,
  removeLayer,
  closePrompt,
}) => {
  const language = useContext(LanguageContext);

  return (
    <div className={`layer-delete-prompt ${active ? "" : "hidden"}`}>
      <div>
        <p>{language.loc.deleteLayerConfirm}</p>
        <button
          className="button delete"
          onClick={() => {
            removeLayer();
            closePrompt();
          }}
        >
          {language.loc.delete}
        </button>
        <button className="button" onClick={closePrompt}>
          {language.loc.cancel}
        </button>
      </div>
    </div>
  );
};

export default LayerDeletePrompt;
