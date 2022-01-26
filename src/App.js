import LayersPanel from './LayersPanel.js';
import SettingsPanel from './SettingsPanel.js';
import Footer from './Footer.js';
import { useCallback, useEffect, useState } from 'react';
import { id, loadImage } from './Helper.js';
import images from './images/images.js';
import i18n from './data/i18n.json';

const furiganaSize = 15;
const emotionFromSide = 180;
const emotionYPos = 250;
const textures = {};
let drawing = false;
let layerId = 0;

export default function App() {

  let savedLang = localStorage.getItem('pageLanguage');
  // If no saved language or language is not found, default to English
  if (!savedLang || !i18n[savedLang]) {
    savedLang = 'en';
  }
  document.documentElement.lang = i18n[savedLang].bcp47;
  document.title = i18n[savedLang].loc.title;

  const [layers, setLayers] = useState([
    newLayer(i18n[savedLang].loc.layers.default.background, images.background),
    newLayer(i18n[savedLang].loc.layers.default.portrait, images.portrait)
  ]);
  const [settings, setSettings] = useState({
    speaker: i18n[savedLang].loc.settings.default.speaker,
    dialogueText: i18n[savedLang].loc.settings.default.dialogueText,
    dialogueType: 'dialogue',
    font: savedLang,
    emotion: 'none',
    emotionSide: 'l',
    emotionOffsetX: 0,
    emotionOffsetY: 0
  });

  const [pageLang, setPageLang] = useState(savedLang);

  const updateDraw = useCallback(() => drawDialogueScreen(settings, layers), [settings, layers]);

  useEffect(() => {
    updateDraw();
  }, [layers, settings, updateDraw]);

  return (
    <div>
      <h1 id="top">{i18n[pageLang].loc.title}</h1>
      <canvas id='preview' width='250' height='445' onContextMenu={e => { e.preventDefault(); downloadImage(e); }}></canvas>
      <section>
        <LayersPanel
          layers={layers}
          updateLayer={updateLayer}
          addLayer={addLayerDefault}
          removeLayer={removeLayer}
          reorderLayer={reorderLayer}
          drawDialogueScreen={drawDialogueScreen}
          pageLang={pageLang}
        />
        <SettingsPanel
          settings={settings}
          updateSettings={updateSettings}
          pageLang={pageLang}
          downloadImage={downloadImage}
        />
      </section>
      <canvas id='editor' width='750' height='1334' className='hidden'></canvas>
      <Footer pageLang={pageLang} setLanguage={setLanguage} />
      <a href='#top' id='toTop'>To Top</a>
    </div>
  );


  function setLanguage(language) {
    localStorage.setItem('pageLanguage', language);
    document.documentElement.lang = i18n[language].bcp47;
    document.title = i18n[language].loc.title;
    setPageLang(language);
  }

  /**
   * Add a new default layer
   * @param {string} layerName - Name of the new layer to add
   * @param {string} imgSrc - Image source for the new layer
   */
  function addLayerDefault() {
    return addLayer(`${i18n[pageLang].loc.layers.layer} ${layers.length + 1}`, images.portrait);
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
      'image': imgSrc,
      'offsetX': 0,
      'offsetY': 0,
      'rotation': 0,
      'scale': 1,
      'opacity': 1,
      'flipX': false
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
    const loc = i18n[pageLang];
    e.target.innerText = loc.generating;
    try {
      const blob = await new Promise(resolve => id('editor').toBlob(resolve, 'image/png'));
      e.target.innerText = loc.download;
      let link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${id('name').value.toLowerCase()}_dialogue_screen.png`;
      link.click();
    } catch (error) {
      console.error(error);
      e.target.innerText = loc.download;
    }
  }
}

/**
 * Generate a new id to associate with a new layer
 * @returns {number} A new number id
 */
function getNewId() {
  layerId++;
  return layerId;
}

/**
 * Draws the dialogue screen based on inputs
 */
async function drawDialogueScreen(settings, layers) {
  if (drawing) return;
  drawing = true;

  try {
    // Get canvas context
    const canvas = id('editor');
    const preview = id('preview');
    const ctx = canvas.getContext('2d');
    const ctxPreview = preview.getContext('2d');

    // Get draw type
    const dialogueType = settings.dialogueType;
    const lang = settings.font;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctxPreview.clearRect(0, 0, preview.width, preview.height);

    let bar = await loadTexture('bar');

    if (dialogueType === 'intro') {
      bar = await loadTexture('introBar');
      ctx.drawImage(await loadTexture('introBack'), 0, 0);
    }
    if (dialogueType === 'caption' || dialogueType === 'narration') {
      bar = await loadTexture('caption');
    }
    if (dialogueType === 'full') {
      bar = await loadTexture('fullscreen');
    }
    if (dialogueType === 'book') {
      ctx.drawImage(await loadTexture('book'), 0, 0);
      bar = await loadTexture('skip_' + lang);
    }

    // Draw Layers
    if (layers) {
      for (let i = 0; i < layers.length; i++) {
        let layer = layers[i];
        let image = id(`img_${layer.id}`);
        if (!image.complete) {
          // If image has not loaded wait for image to load
          await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; });
        }
        drawImageWithData(ctx, id(`img_${layer.id}`), canvas.width / 2, canvas.height / 2, layer, dialogueType === 'intro')
      }
    }

    await drawEmotion(settings, ctx);

    ctx.drawImage(bar, 0, 0);
    // If language is not English, we draw the skip button in other language
    if (lang !== 'en') {
      ctx.drawImage(await loadTexture('skip_' + lang), 0, 0);
    }

    // Wait for font load
    await document.fonts.load(`30px dragalialost_${lang}`);
    drawDialogueText(settings, dialogueType, ctx, lang);

    // Draw the editor canvas on the smaller preview canvas
    ctxPreview.drawImage(canvas, 0, 0, preview.width, preview.height);

  } catch (error) {
    console.error(error);
  }
  drawing = false;
}

async function loadTexture(key) {
  if (!textures[key]) {
    try {
      textures[key] = await loadImage(images[key]);
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  return textures[key];
}

/**
 * Draws the image with given data
 * @param {CanvasRenderingContext2D} ctx - Context of the canvas to draw on
 * @param {number} centerX - Where to center the image's x position at
 * @param {number} centerY - Where to center the image y position at
 * @param {Object} layer - Data of the image
 */
function drawImageWithData(ctx, image, centerX, centerY, layer, dropShadow = false) {
  // Sanitize the data passed in
  centerX = parseFloat(centerX);
  centerY = parseFloat(centerY);
  let scale = parseFloat(layer.scale);
  let offsetX = parseFloat(layer.offsetX);
  let offsetY = -parseFloat(layer.offsetY);
  let rotation = parseFloat(layer.rotation ? layer.rotation : 0);

  let width = image.naturalWidth * scale;
  let height = image.naturalHeight * scale;

  let x = centerX - width / 2 + offsetX;
  let y = centerY - height / 2 + offsetY;

  // Save current context state
  ctx.save();

  // Move the context to the pivot before rotating
  ctx.translate(centerX + offsetX, centerY + offsetY);

  if (layer.flipX) {
    ctx.scale(-1, 1);
  }

  if (rotation !== 0) {
    ctx.rotate(rotation * Math.PI / 180);
  }

  if (dropShadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, .25)';
    ctx.shadowOffsetX = 20;
    ctx.shadowOffsetY = 20;
  }

  ctx.globalAlpha = layer.opacity;

  ctx.translate(-centerX - offsetX, -centerY - offsetY);

  ctx.drawImage(image, x, y, width, height);

  // Restore original state
  ctx.restore();
}

/**
 * Draws the emotion balloon using context from canvas to draw on
 * @param {CanvasRenderingContext2D} ctx - Context of the canvas to draw on
 */
async function drawEmotion(settings, ctx) {
  let emotionName = settings.emotion;
  if (emotionName !== 'none') {
    let emotionSide = settings.emotionSide;
    emotionName += '_' + emotionSide;
    const emotion = await loadTexture(emotionName);
    drawImageWithData(ctx, emotion,
      emotionSide === 'l' ? emotionFromSide : ctx.canvas.width - emotionFromSide,
      emotionYPos,
      {
        'offsetX': settings.emotionOffsetX,
        'offsetY': settings.emotionOffsetY,
        'scale': 1
      });
  }
}

/**
 * Draws the dialogue text using context from canvas to draw on
 * @param {CanvasRenderingContext2D} ctx - Context of the canvas to draw on
 * @param {string} lang - language of the font to draw with
 */
function drawDialogueText(settings, dialogueType, ctx, lang) {
  // Get text property and text to draw
  const textProp = i18n[lang].textProperties;
  const speakerName = settings.speaker;
  const dialogue = settings.dialogueText;

  // Draw speaker name
  ctx.textAlign = 'left';

  ctx.font = `${textProp.nameSize}px dragalialost_${lang}`;
  ctx.fillStyle = 'white';

  if (dialogueType === 'caption') {
    ctx.font = `${textProp.titleSize}px dragalialost_${lang}`;
    ctx.fillText(speakerName, (ctx.canvas.width - ctx.measureText(speakerName).width) / 2, textProp.titleYPos);
    ctx.fillRect(0, 430, ctx.canvas.width, 1);
  } else if (dialogueType === 'intro') {
    drawSpeakerNameIntro(ctx, textProp, lang, speakerName);
  } else if (dialogueType !== 'narration' && dialogueType !== 'full' && dialogueType !== 'book') {
    ctx.fillText(speakerName, textProp.speakerXPos, textProp.speakerYPos);
  }

  // Draw dialogue
  let lines = dialogue.split('\n');

  let fontSize = textProp.dialogueSize;
  let lineHeight = textProp.lineHeight;

  let startX = textProp.dialogueXPos;
  let startY = textProp.dialogueYPos;

  ctx.fillStyle = '#012231';

  if (dialogueType === 'intro') {
    drawTitleIntro(ctx, textProp, lang, dialogue);
    return;
  }

  let center = false;

  if (dialogueType === 'caption') {
    startY = textProp.captionYPos;
    ctx.fillStyle = 'white';
    fontSize = textProp.captionSize;
    center = true;
  } else if (dialogueType === 'narration' || dialogueType === 'full') {
    fontSize = textProp.dialogueSize;
    lineHeight = textProp.narrationLineHeight;
    startY = textProp.narrationYPos - (fontSize + (lines.length - 1) * lineHeight) / 2;
    ctx.fillStyle = 'white';
    center = true;
  } else if (dialogueType === 'book') {
    fontSize = textProp.dialogueSize;
    lineHeight = textProp.narrationLineHeight;
    startY = ctx.canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;
    ctx.fillStyle = '#412c29';
    center = true;
  }

  ctx.font = `${fontSize}px dragalialost_${lang}`;

  // Draw line by line
  for (let i = 0; i < lines.length; i++) {
    let x = startX;
    if (center) {
      let base = lines[i].replace(/\(([^)]+)\)\{([^}]+)\}/g, (match, base, furigana, offset, string) => base);
      x = (ctx.canvas.width - ctx.measureText(base).width) / 2;
    }
    let y = startY + i * lineHeight;
    drawDialogueLine(ctx, lang, lines[i], fontSize, x, y);
  }
}

/**
 * Draws a line of text starting at the provided position
 * @param {CanvasRenderingContext2D} ctx - Context of the canvas to draw on
 * @param {string} lang - Language of the font to draw with
 * @param {string} text - Text to draw
 * @param {number} fontSize - Default size of the dialogue text in provided language
 * @param {number} startX - Starting x position to draw text from
 * @param {number} startY - Starting y position to draw text from
 */
function drawDialogueLine(ctx, lang, text, fontSize, startX, startY) {
  let tmp = '';
  let last = 0;
  const normalFont = `${fontSize}px dragalialost_${lang}`;
  const furiganaFont = `${furiganaSize}px dragalialost_${lang}`;

  // Draw the furigana first by removing them from the line
  text = text.replace(/\(([^)]+)\)\{([^}]+)\}/g, (match, base, furigana, offset, string) => {
    tmp += text.substring(last, offset);

    // Use normal font size first
    ctx.font = normalFont;
    // Measure the length so far, add the half of the text below the furigana for the center
    let center = startX + ctx.measureText(tmp).width + ctx.measureText(base).width / 2;

    // Change to smaller font, measure where to start the furigana
    ctx.font = furiganaFont;
    let furiganaX = center - ctx.measureText(furigana).width / 2;
    let furiganaY = startY - fontSize + 2;
    ctx.fillText(furigana, furiganaX, furiganaY);

    tmp += base;
    last = offset + base.length + furigana.length + 4;

    return base;
  });

  // Draw text without furigana
  ctx.font = normalFont;
  ctx.fillText(text, startX, startY);
}

/**
 * Draws the speaker's name slanted for intro
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} textProp - property of the text
 * @param {string} lang - Language of the font to draw with
 * @param {string} speakerName - Text to draw
 */
function drawSpeakerNameIntro(ctx, textProp, lang, speakerName) {
  ctx.save();

  ctx.font = `${textProp.introNameSize}px dragalialost_${lang}`;
  let textWidth = ctx.measureText(speakerName).width;

  let x = ctx.canvas.width;
  ctx.translate(x, textProp.introNameYPos);
  ctx.rotate(-6.25 * Math.PI / 180);
  ctx.translate(-x, -textProp.introNameYPos);

  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 8;
  ctx.miterLimit = 2;
  ctx.strokeText(speakerName, ctx.canvas.width - textWidth - textProp.introXPos, textProp.introNameYPos);
  ctx.fillText(speakerName, ctx.canvas.width - textWidth - textProp.introXPos, textProp.introNameYPos);

  ctx.restore();
}

/**
 * Draws the speaker's name slanted for intro
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} textProp - property of the text
 * @param {string} lang - Language of the font to draw with
 * @param {string} speakerName - Text to draw
 */
function drawTitleIntro(ctx, textProp, lang, text) {
  ctx.save();

  ctx.font = `${textProp.introTitleSize}px dragalialost_${lang}`;
  let textWidth = ctx.measureText(text).width;

  let x = ctx.canvas.width;
  ctx.translate(x, textProp.introTitleYPos);
  ctx.rotate(-6.25 * Math.PI / 180);
  ctx.translate(-x, -textProp.introTitleYPos);

  ctx.fillStyle = '#333333';
  ctx.fillText(text, ctx.canvas.width - textWidth - textProp.introXPos, textProp.introTitleYPos);

  ctx.restore();
}
