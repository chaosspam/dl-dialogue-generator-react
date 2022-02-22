import LayersPanel from './LayersPanel.js';
import SettingsPanel from './SettingsPanel.js';
import Footer from './Footer.js';
import Filters from './Filters.js';

import { useCallback, useEffect, useRef, useState } from 'react';

import images from '../helper/images.js';
import i18n from '../data/i18n.json';
import { LanguageContext, useLanguage } from '../context/language-context.js';
import { drawDialogueScreen, wrapLines, canvas } from '../helper/dragalia_canvas.js';

let layerId = 0;

const isWebkit = navigator.userAgent.indexOf('AppleWebKit') !== -1;

export default function App() {

  const previewRef = useRef(null);

  const [language, changeLanguage] = useLanguage(i18n);

  const [layers, setLayers] = useState([
    newLayer(language.loc.layers.default.background, images.background),
    newLayer(language.loc.layers.default.portrait, images.portrait)
  ]);

  const [settings, setSettings] = useState({
    speaker: language.loc.settings.default.speaker,
    dialogueText: language.loc.settings.default.dialogueText,
    dialogueType: 'dialogue',
    font: language.code,
    emotion: 'none',
    emotionSide: 'l',
    emotionOffsetX: 0,
    emotionOffsetY: 0
  });

  // Memoize draw call
  const updateDraw = useCallback(() => {
    if(previewRef && previewRef.current) {
      drawDialogueScreen(settings, layers, previewRef.current);
    } else {
      drawDialogueScreen(settings, layers, null);
    }
  }, [settings, layers, previewRef]);

  useEffect(() => {
    updateDraw();
  }, [layers, settings, updateDraw]);

  /**
   * Add a new default layer
   * @param {string} layerName - Name of the new layer to add
   * @param {string} imgSrc - Image source for the new layer
   */
  function addLayerDefault() {
    return addLayer(`${language.loc.layers.layer} ${layers.length + 1}`, images.portrait);
  }

  /**
   * Add a new layer
   * @param {string} layerName - Name of the new layer to add
   * @param {string} imgSrc - Image source for the new layer
   */
  function addLayer(layerName, imgSrc) {
    const toAdd = newLayer(layerName, imgSrc);
    setLayers([...layers, toAdd]);
    return toAdd;
  }

  function newLayer(layerName, imgSrc) {
    // Get a new id
    const layerId = getNewId();
    // Create data for new layer
    let newLayer = {
      'name': layerName,
      'id': layerId,
      'image': new Image(imgSrc),
      'src': imgSrc,
      'offsetX': 0,
      'offsetY': 0,
      'rotation': 0,
      'scale': 1,
      'opacity': 1,
      'flipX': false,
      'filter': ''
    }
    return newLayer;
  }

  /**
   * Remove the layer that is set to be removed
   */
  function removeLayer(id) {
    if (layers.length <= 1) return;
    setLayers(layers.filter(layer => layer.id !== id));
  }

  /**
   * Reorder the layers based on the document order
   */
  function reorderLayer(result) {
    if (result.over) {
      // Get the tabs
      setLayers((prevLayers) => {
        const layers = [...prevLayers];
        const fromIndex = layers.findIndex(x => `tab_${x.id}` === result.active.id);
        const toIndex = layers.findIndex(x => `tab_${x.id}` === result.over.id);
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

  function updateLayer(updateLayerId, updated) {
    setLayers(prevLayers => prevLayers.map(layer => layer.id === updateLayerId ? Object.assign(layer, updated) : layer));
  }

  function updateSettings(updated) {
    setSettings(prevSettings => Object.assign({}, prevSettings, updated));
  }

  /**
   * Generate a download link and click it
   */
  async function downloadImage(e) {
    const settingsLoc = language.loc.settings;
    e.target.innerText = settingsLoc.generating;
    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      e.target.innerText = settingsLoc.download;
      let link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${settings.speaker.toLowerCase()}_dialogue_screen.png`;
      link.click();
    } catch (error) {
      console.error(error);
      e.target.innerText = settingsLoc.download;
    }
  }

  const layerOperations = { updateLayer, addLayerDefault, removeLayer, reorderLayer };

  return (
    <LanguageContext.Provider value={language}>
      <Filters />
      <h1 id="top">{language.loc.title}</h1>
      <canvas
        id='preview'
        ref={previewRef}
        width='250'
        height='445'
        onContextMenu={e => { e.preventDefault(); downloadImage(e); }}
      >
      </canvas>
      <section>
        <LayersPanel
          layers={layers}
          layerOperations={layerOperations}
          drawDialogueScreen={drawDialogueScreen}
          preview={previewRef}
          isWebkit={isWebkit}
        />
        <SettingsPanel
          settings={settings}
          updateSettings={updateSettings}
          downloadImage={downloadImage}
          wrapLines={wrapLines}
        />
      </section>
      <Footer changeLanguage={changeLanguage} />
      <a href='#top' id='toTop'>To Top</a>
    </LanguageContext.Provider>
  );
}

/**
 * Generate a new id to associate with a new layer
 * @returns {number} A new number id
 */
function getNewId() {
  layerId++;
  return layerId;
}
