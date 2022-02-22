import React, { useContext } from 'react';
import { LanguageContext } from '../context/language-context';

import SliderGroup from './SliderGroup';

export default function SettingsPanel({ settings, updateSettings, downloadImage, wrapLines }) {

  const language = useContext(LanguageContext);
  const loc = language.loc.settings;

  function autoWrap(e) {
    const wrapped = wrapLines(settings.dialogueText, settings.dialogueType, language.code);
    updateSettings({ dialogueText: wrapped });
  }

  function updateDialogueType(e) {
    updateSettings({ dialogueType: e.currentTarget.value });
  }

  function updateFont(e) {
    updateSettings({ font: e.currentTarget.value });
  }

  function updateEmotionSide(e) {
    updateSettings({ emotionSide: e.currentTarget.value });
  }


  return (
    <div id='dialogueArea' className='settings'>

      <div>
        <label>{loc.speakerName}</label>
        <input type='text' placeholder='Speaker Name' id='name' value={settings.speaker} onChange={e => updateSettings({ speaker: e.target.value })} />
      </div>

      <div>
        <label>{loc.dialogueText}</label>
        <textarea id='dialogue' cols='45' rows='5' value={settings.dialogueText} onChange={e => updateSettings({ dialogueText: e.target.value })} ></textarea>
      </div>

      <div>
        <button className='button' id='autowrap' onClick={autoWrap}>{loc.autowrap}</button>
      </div>

      <div>
        <label>{loc.dialogueType}</label>
        <input type='radio' name='stdialogue' value='dialogue' id='std-dialogue' checked={settings.dialogueType === 'dialogue'} onChange={updateDialogueType} />
        <label htmlFor='std-dialogue'>{loc.stdialogue_dialogue}</label>
        <input type='radio' name='stdialogue' value='intro' id='std-intro' checked={settings.dialogueType === 'intro'} onChange={updateDialogueType} />
        <label htmlFor='std-intro'>{loc.stdialogue_intro}</label>
        <input type='radio' name='stdialogue' value='caption' id='std-caption' checked={settings.dialogueType === 'caption'} onChange={updateDialogueType} />
        <label htmlFor='std-caption'>{loc.stdialogue_caption}</label>
        <br />
        <input type='radio' name='stdialogue' value='full' id='std-full' checked={settings.dialogueType === 'full'} onChange={updateDialogueType} />
        <label htmlFor='std-full'>{loc.stdialogue_full}</label>
        <input type='radio' name='stdialogue' value='narration' id='std-narration' checked={settings.dialogueType === 'narration'} onChange={updateDialogueType} />
        <label htmlFor='std-narration'>{loc.stdialogue_narration}</label>
        <input type='radio' name='stdialogue' value='book' id='std-book' checked={settings.dialogueType === 'book'} onChange={updateDialogueType} />
        <label htmlFor='std-book'>{loc.stdialogue_book}</label>
      </div>

      <div>
        <label>{loc.font}</label>
        <input type='radio' id='en' name='font' value='en' checked={settings.font === 'en'} onChange={updateFont} />
        <label htmlFor='en'>{loc.font_en}</label>
        <input type='radio' id='jp' name='font' value='ja' checked={settings.font === 'ja'} onChange={updateFont} />
        <label htmlFor='jp'>{loc.font_ja}</label>
        <br />
        <input type='radio' id='zh_tw' name='font' value='zh_tw' checked={settings.font === 'zh_tw'} onChange={updateFont} />
        <label htmlFor='zh_tw'>{loc.font_zh_tw}</label>
        <input type='radio' id='zh_cn' name='font' value='zh_cn' checked={settings.font === 'zh_cn'} onChange={updateFont} />
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

      <div>
        <label>{loc.emotion_side}</label>
        <input type='radio' id='left' name='emotionside' value='l' checked={settings.emotionSide === 'l'} onChange={updateEmotionSide} />
        <label htmlFor='left'>{loc.left}</label>
        <input type='radio' id='right' name='emotionside' value='r' checked={settings.emotionSide === 'r'} onChange={updateEmotionSide} />
        <label htmlFor='right'>{loc.right}</label>
      </div>

      <SliderGroup
        label={loc.emotion_x} min='-200' max='200' step='0.1'
        value={settings.emotionOffsetX}
        onChange={e => updateSettings({ emotionOffsetX: e.target.value })}
      />

      <SliderGroup
        label={loc.emotion_y} min='-200' max='200' step='0.1'
        value={settings.emotionOffsetY}
        onChange={e => updateSettings({ emotionOffsetY: e.target.value })}
      />

      <div>
        <button className='button' id='download' onClick={downloadImage}>{loc.download}</button>
      </div>

    </div>
  );
}