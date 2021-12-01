import React from 'react';
import i18n from './data/i18n.json';
import { id } from './Helper.js';

function SettingsPanel(props) {
  const { settings, updateSettings, pageLang } = props;
  const loc = i18n[pageLang].loc.settings;

  /**
   * Generate a download link and click it
   */
  async function downloadImage(e) {
    e.target.innerText = loc.generating;
    try {
      const blob = await new Promise(resolve => id('editor').toBlob(resolve, 'image/png'));
      e.target.innerText = loc.download;
      let link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${id('name').value.toLowerCase()}_dialogue_screen.png`;
      link.click();
    } catch(error) {
      console.error(error);
      e.target.innerText = loc.download;
    }
  }

  return (
    <div id='dialogueArea' className='settings'>

      <div>
        <label>{loc.speakerName}</label>
        <input type='text' placeholder='Speaker Name' id='name' defaultValue={settings.speaker} onChange={e => updateSettings(settings.id, { speaker: e.target.value })} />
      </div>

      <div>
        <label>{loc.dialogueText}</label>
        <textarea id='dialogue' cols='45' rows='5' defaultValue={settings.dialogueText} onChange={e => updateSettings({ dialogueText: e.target.value })} ></textarea>
      </div>

      <div onChange={e => updateSettings({ dialogueType: e.target.value })} >
        <label>{loc.dialogueType}</label>
        <input type='radio' name='stdialogue' value='dialogue' id='std-dialogue' defaultChecked={settings.dialogueType === 'dialogue'} />
        <label htmlFor='std-dialogue'>{loc.stdialogue_dialogue}</label>
        <input type='radio' name='stdialogue' value='intro' id='std-intro' defaultChecked={settings.dialogueType === 'intro'} />
        <label htmlFor='std-intro'>{loc.stdialogue_intro}</label>
        <input type='radio' name='stdialogue' value='caption' id='std-caption' defaultChecked={settings.dialogueType === 'caption'} />
        <label htmlFor='std-caption'>{loc.stdialogue_caption}</label>
        <br />
        <input type='radio' name='stdialogue' value='full' id='std-full' defaultChecked={settings.dialogueType === 'full'} />
        <label htmlFor='std-full'>{loc.stdialogue_full}</label>
        <input type='radio' name='stdialogue' value='narration' id='std-narration' defaultChecked={settings.dialogueType === 'narration'} />
        <label htmlFor='std-narration'>{loc.stdialogue_narration}</label>
        <input type='radio' name='stdialogue' value='book' id='std-book' defaultChecked={settings.dialogueType === 'book'} />
        <label htmlFor='std-book'>{loc.stdialogue_book}</label>
      </div>

      <div onChange={e => updateSettings({ font: e.target.value })} >
        <label>{loc.font}</label>
        <input type='radio' id='en' name='font' value='en' defaultChecked={settings.font === 'en'} />
        <label htmlFor='en'>{loc.font_en}</label>
        <input type='radio' id='jp' name='font' value='ja' defaultChecked={settings.font === 'ja'} />
        <label htmlFor='jp'>{loc.font_ja}</label>
        <br />
        <input type='radio' id='zh_tw' name='font' value='zh_tw' defaultChecked={settings.font === 'zh_tw'} />
        <label htmlFor='zh_tw'>{loc.font_zh_tw}</label>
        <input type='radio' id='zh_cn' name='font' value='zh_cn' defaultChecked={settings.font === 'zh_cn'} />
        <label htmlFor='zh_cn'>{loc.font_zh_cn}</label>
      </div>

      <div>
        <label>{loc.emotion}</label>
        <select id='emotion' value={settings.emotion} onChange={e => updateSettings({ emotion: e.target.value })} >
          <option value='none'>{loc.emotion_none}</option>
          <option value='anger'>{loc.emotion_anger}</option>
          <option value='bad'>{loc.emotion_bad}</option>
          <option value='exclamation'>{loc.emotion_exclamation}</option>
          <option value='heart'>{loc.emotion_heart}</option>
          <option value='inspiration'>{loc.emotion_inspiration}</option>
          <option value='note'>{loc.emotion_note}</option>
          <option value='notice'>{loc.emotion_notice}</option>
          <option value='question'>{loc.emotion_question}</option>
          <option value='sleep'>{loc.emotion_sleep}</option>
          <option value='sweat'>{loc.emotion_sweat}</option>
        </select>
      </div>

      <div onChange={e => updateSettings({ emotionSide: e.target.value })}>
        <label>{loc.emotion_side}</label>
        <input type='radio' id='left' name='emotionside' value='l' defaultChecked={settings.emotionSide === 'l'} />
        <label htmlFor='left'>{loc.left}</label>
        <input type='radio' id='right' name='emotionside' value='r' defaultChecked={settings.emotionSide === 'r'} />
        <label htmlFor='right'>{loc.right}</label>
      </div>

      <div>
        <label>{loc.emotion_x}</label>
        <div className='input-group'>
          <input type='number' id='emotionOffsetX' min='-200' max='200' value={settings.emotionOffsetX} onChange={e => updateSettings({ emotionOffsetX: e.target.value })} />
          <input type='range' min='-200' max='200' value={settings.emotionOffsetX} onChange={e => updateSettings({ emotionOffsetX: e.target.value })} />
        </div>
      </div>

      <div>
        <label>{loc.emotion_y}</label>
        <div className='input-group'>
          <input type='number' id='emotionOffsetY' min='-200' max='200' value={settings.emotionOffsetY} onChange={e => updateSettings({ emotionOffsetY: e.target.value })} />
          <input type='range' min='-200' max='200' value={settings.emotionOffsetY} onChange={e => updateSettings({ emotionOffsetY: e.target.value })} />
        </div>
      </div>

      <div>
        <button className='button' id='download' onClick={downloadImage}>{loc.download}</button>
      </div>

    </div>
  );
}

export default SettingsPanel;