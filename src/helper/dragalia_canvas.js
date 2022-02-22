import { id, loadImage } from '../helper/helper.js';
import textProperties from '../data/text_properties.json';
import images from '../helper/images.js';

const furiganaSize = 15;
const emotionFromSide = 180;
const emotionYPos = 250;
const textures = {};
const canvasWidth = 750;
const canvasHeight = 1334;
let drawing = false;

const canvas = document.createElement('canvas');
canvas.width = canvasWidth;
canvas.height = canvasHeight;

/**
 * Draws the dialogue screen based on inputs
 */
async function drawDialogueScreen(settings, layers, preview) {
  if (drawing) return;
  drawing = true;

  try {
    // Get canvas context
    const ctx = canvas.getContext('2d');

    // Get draw type
    const dialogueType = settings.dialogueType;
    const lang = settings.font;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
        let image = layer.image;
        if (!image.complete) {
          // If image has not loaded wait for image to load
          await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; });
        }
        drawImageWithData(ctx, image, canvas.width / 2, canvas.height / 2, layer, dialogueType === 'intro')
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
    if (preview) {
      const ctxPreview = preview.getContext('2d');
      ctxPreview.clearRect(0, 0, preview.width, preview.height);
      ctxPreview.drawImage(canvas, 0, 0, preview.width, preview.height);
    }

  } catch (error) {
    console.error('Failed to draw canvas', error);
  }
  drawing = false;
}

async function loadTexture(key) {
  if (!textures[key]) {
    try {
      textures[key] = await loadImage(images[key]);
    } catch (error) {
      console.error(`Failed to retrieve texture of key: ${key}`, error);
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

  ctx.filter = layer.filter;

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
  const textProp = textProperties[lang];
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
    fontSize = textProp.captionSize;
    startY = textProp.captionYPos;
    ctx.fillStyle = 'white';
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

/**
 * Returns a dialogue string that is wrapped, where new lines are inserted to
 * where the words should break up in the dialogue box
 * @param {string} dialogue - the dialogue text to wrap
 * @param {string} dialogueType - the type of the dialogue for font size
 * @param {string} lang - language for the font type
 * @returns
 */
function wrapLines(dialogue, dialogueType, lang) {
  const ctx = canvas.getContext('2d');
  const textProp = textProperties[lang];

  if (!ctx) {
    return dialogue;
  }

  // Determine the size of the font
  let fontSize = textProp.dialogueSize;
  if (dialogueType === 'caption') {
    fontSize = textProp.captionSize;
  } else if (dialogueType === 'narration' || dialogueType === 'full') {
    fontSize = textProp.dialogueSize;
  } else if (dialogueType === 'book') {
    fontSize = textProp.dialogueSize;
  }

  let margin = textProp.dialogueXPos;

  ctx.font = `${fontSize}px dragalialost_${lang}`;

  const canvasWidth = ctx.canvas.width;
  const maxLineWidth = canvasWidth - (2 * margin);
  // Break down dialogue to tokens
  const tokens = dialogue.split(/\s+/);
  const lines = [];
  let currLine = [];

  while (tokens.length > 0) {
    // Grab a token
    const token = tokens.shift();

    // We first add the token to the current line
    const line = [...currLine, token];
    const lineText = line.join(' ');

    // We measure the length of the text in the line
    const base = lineText.replace(/\(([^)]+)\)\{[^}]+\}/g, (match, base) => base);
    const lineWidth = ctx.measureText(base).width;

    // If the line is shorter than max width, we add the token to the line
    if (lineWidth <= maxLineWidth) {
      currLine = line;
      if (tokens.length === 0) {
        lines.push(currLine.join(' '));
      }
    } else {
      // Otherwise, we check if this is the only token in this line

      // If it is, we need to break up this token (sad)
      if (line.length === 1) {
        let subtokens = [];
        let last = 0;
        token.replace(/\([^)]+\)\{[^}]+\}/g, (match, offset) => {
          subtokens = subtokens.concat(token.substring(last, offset).split(''));
          subtokens.push(match);
          last = offset + match.length;
          return match;
        });
        subtokens = subtokens.concat(token.substring(last).split(''));

        let fragment = '';
        while (subtokens.length > 0) {
          // Grab a subtoken
          const subtoken = subtokens.shift();
          // Add the subtoken to the fragment
          const lineText = fragment + subtoken;
          // We measure the length of the fragment
          const base = lineText.replace(/\(([^)]+)\)\{[^}]+\}/g, (match, base) => base);
          const fragWidth = ctx.measureText(base).width;

          // If the fragment is shorter than max width, we add the subtoken to the fragment
          if (fragWidth <= maxLineWidth) {
            fragment = lineText;
          } else {
            // Otherwise, we check this is a single subtoken that's too big
            currLine = [];
            // If it is, we can't break it up further, so we just push it
            if (fragment === '') {
              lines.push(lineText);
              // Otherwise, we join this and the remaining subtokens back as a token
              // Push the current fragment as a line, and get a new line
            } else {
              lines.push(fragment);
              subtokens.unshift(subtoken);
              tokens.unshift(subtokens.join(''));
              subtokens = [];
            }
          }
        }

        // Otherwise, we place this token back in the queue
        // and get a new line
      } else {
        lines.push(currLine.join(' '));
        currLine = [];
        tokens.unshift(token);
      }
    }
  }
  return lines.join('\n');
}

export { drawDialogueScreen, wrapLines, canvas };