import "./App.scss";

import { LayersPanel } from "./LayersPanel";
import SettingsPanel from "./SettingsPanel";
import Footer from "./Footer";
import Filters from "./Filters";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp, faThumbTack } from "@fortawesome/free-solid-svg-icons";

import {
  drawDialogueScreen,
  wrapLines,
  canvas,
} from "../helper/dragalia_canvas";

import { DialogueType, Emotion, Layer, Settings } from "../types/data";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import i18n from "../data/i18n.json";
import { LanguageContext, useLanguage } from "../context/language-context";
import { DragEndEvent } from "@dnd-kit/core";

export interface LayerOperations {
  addLayerDefault: () => Layer;
  removeLayer: (id: number) => void;
  reorderLayer: (result: DragEndEvent) => void;
  updateLayer: (updateLayerId: number | undefined, updated: any) => void;
}

let layerId = 0;

const App: FunctionComponent = () => {
  const previewRef = useRef(null);

  const [language, changeLanguage] = useLanguage(i18n);
  const [layers, setLayers] = useState<Layer[]>([
    newLayer(
      language.loc.layers.default.background,
      "images/exampleBackground.png"
    ),
    newLayer(
      language.loc.layers.default.portrait,
      "images/examplePortrait.png"
    ),
  ]);

  const [settings, setSettings] = useState<Settings>({
    speaker: language.loc.settings.default.speaker,
    dialogueText: language.loc.settings.default.dialogueText,
    dialogueType: DialogueType.Dialogue,
    font: language.code,
    emotion: Emotion.None,
    emotionIsLeft: true,
    emotionOffsetX: 0,
    emotionOffsetY: 0,
  });

  const [canvasPinned, setCanvasPinned] = useState(false);

  // Memoize draw call
  const updateDraw = useCallback(() => {
    if (previewRef && previewRef.current) {
      drawDialogueScreen(settings, layers, previewRef.current);
    } else {
      drawDialogueScreen(settings, layers);
    }
  }, [settings, layers, previewRef]);

  useEffect(() => {
    updateDraw();
  }, [layers, settings, updateDraw]);

  /**
   * Add a new default layer
   */
  function addLayerDefault(): Layer {
    return addLayer(
      `${language.loc.layers.layer} ${layers.length + 1}`,
      "images/examplePortrait.png"
    );
  }

  /**
   * Add a new layer
   * @param {string} layerName - Name of the new layer to add
   * @param {string} imgSrc - Image source for the new layer
   */
  function addLayer(layerName: string, imgSrc: string): Layer {
    const toAdd = newLayer(layerName, imgSrc);
    setLayers([...layers, toAdd]);
    return toAdd;
  }

  /**
   * Returns a new layer object
   * @param {string} layerName - Name of the new layer to add
   * @param {string} imgSrc - Image source for the new layer
   */
  function newLayer(layerName: string, imgSrc: string): Layer {
    // Get a new id
    const layerId = getNewId();
    const image = new Image();
    image.src = imgSrc;

    // Create data for new layer
    let newLayer: Layer = {
      name: layerName,
      id: layerId,
      image: image,
      src: imgSrc,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      scale: 1,
      opacity: 1,
      flipX: false,
      filter: "",
    };

    return newLayer;
  }

  /**
   * Remove the layer that is set to be removed
   */
  function removeLayer(id: number) {
    if (layers.length <= 1) return;
    setLayers(layers.filter((layer) => layer.id !== id));
  }

  /**
   * Reorder the layers based on the document order
   */
  function reorderLayer(result: DragEndEvent) {
    if (result.over) {
      const over = result.over;
      // Get the tabs
      setLayers((prevLayers) => {
        const layers = [...prevLayers];
        const fromIndex = layers.findIndex(
          (x) => `tab_${x.id}` === result.active.id
        );
        const toIndex = layers.findIndex((x) => `tab_${x.id}` === over.id);
        if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
          const tmp = layers[fromIndex];
          const dir = toIndex < fromIndex ? -1 : 1;
          for (let i = fromIndex; i !== toIndex; i += dir) {
            layers[i] = layers[i + dir];
          }
          layers[toIndex] = tmp;
        }
        return layers;
      });
    }
  }

  function updateLayer(updateLayerId: number | undefined, updated: Layer) {
    setLayers((prevLayers) =>
      prevLayers.map((layer) =>
        layer.id === updateLayerId ? Object.assign({}, layer, updated) : layer
      )
    );
  }

  function updateSettings(updated: any) {
    setSettings((prevSettings) => Object.assign({}, prevSettings, updated));
  }

  /**
   * Generate a download link and click it
   */
  async function downloadImage(
    e: React.MouseEvent<Element, MouseEvent>
  ): Promise<any> {
    const downloadButton = e.currentTarget as HTMLButtonElement;

    const settingsLoc = language.loc.settings;
    downloadButton.innerText = settingsLoc.generating;
    try {
      const blob: any = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      downloadButton.innerText = settingsLoc.download;
      let link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${settings.speaker.toLowerCase()}_dialogue_screen.png`;
      link.click();
    } catch (error) {
      console.error(error);
      downloadButton.innerText = settingsLoc.download;
    }
  }

  const layerOperations: LayerOperations = {
    updateLayer,
    addLayerDefault,
    removeLayer,
    reorderLayer,
  };

  return (
    <LanguageContext.Provider value={language}>
      <header className="header">
        <img
          className="header__brand"
          src="/images/notice_l.png"
          alt="Dialogue Generator Logo"
        />
        <div>
          <h1 className="header__title" id="top">
            {language.loc.headtitle}
          </h1>
          <h2 className="header__subtitle" id="top">
            {language.loc.subtitle}
          </h2>
        </div>
      </header>
      <canvas
        className={`preview-canvas${canvasPinned ? " pinned" : ""}`}
        ref={previewRef}
        width="500"
        height="890"
        title="Right click to save"
        onContextMenu={(e) => {
          e.preventDefault();
          downloadImage(e);
        }}
      ></canvas>
      {canvasPinned && <div className="dummy"></div>}
      <section className="edit-section">
        <LayersPanel layers={layers} layerOperations={layerOperations} />
        <SettingsPanel
          settings={settings}
          updateSettings={updateSettings}
          downloadImage={downloadImage}
          wrapLines={wrapLines}
        />
      </section>
      <Footer changeLanguage={changeLanguage} />
      <button
        className="fixed-btn--pin"
        onClick={() => setCanvasPinned(!canvasPinned)}
        style={canvasPinned ? { backgroundColor: "#93b8ff" } : undefined}
      >
        <FontAwesomeIcon icon={faThumbTack} />
        <span className="sr-only">Pin</span>
      </button>
      <a href="#top" className="fixed-btn--top">
        <FontAwesomeIcon icon={faAngleUp} />
        <span className="sr-only">To Top</span>
      </a>
      <Filters />
    </LanguageContext.Provider>
  );
};

/**
 * Generate a new id to associate with a new layer
 * @returns {number} A new number id
 */
function getNewId() {
  layerId++;
  return layerId;
}

export default App;
