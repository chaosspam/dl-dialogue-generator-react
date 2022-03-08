import React, { FunctionComponent, useContext } from "react";
import { LanguageContext } from "../context/language-context";
import { DialogueType, Emotion, Settings } from "../types/data";

import SliderGroup from "./SliderGroup";

interface SettingPanelProps {
  settings: Settings;
  updateSettings: (updated: any) => void;
  downloadImage: (e: React.MouseEvent<Element, MouseEvent>) => Promise<any>;
  wrapLines: (
    dialogue: string,
    dialogueType: DialogueType,
    lang: string
  ) => string;
}

const SettingsPanel: FunctionComponent<SettingPanelProps> = ({
  settings,
  updateSettings,
  downloadImage,
  wrapLines,
}) => {
  const language = useContext(LanguageContext);
  const loc = language.loc.settings;

  function autoWrap(e: React.MouseEvent<HTMLButtonElement>) {
    const wrapped = wrapLines(
      settings.dialogueText,
      settings.dialogueType,
      language.code
    );
    updateSettings({ dialogueText: wrapped });
  }

  function updateDialogueType(e: React.ChangeEvent<HTMLSelectElement>) {
    updateSettings({ dialogueType: e.currentTarget.value });
  }

  function updateFont(e: React.ChangeEvent<HTMLSelectElement>) {
    updateSettings({ font: e.currentTarget.value });
  }

  function updateEmotionSide(left: boolean) {
    updateSettings({ emotionIsLeft: left });
  }

  return (
    <div id="dialogueArea" className="settings">
      <div>
        <label>{loc.speakerName}</label>
        <input
          type="text"
          placeholder="Speaker Name"
          id="name"
          value={settings.speaker}
          onChange={(e) => updateSettings({ speaker: e.target.value })}
        />
      </div>

      <div>
        <label>{loc.dialogueText}</label>
        <textarea
          id="dialogue"
          cols={45}
          rows={5}
          value={settings.dialogueText}
          onChange={(e) => updateSettings({ dialogueText: e.target.value })}
        ></textarea>
      </div>

      <div>
        <button className="button" id="autowrap" onClick={autoWrap}>
          {loc.autowrap}
        </button>
      </div>

      <div>
        <label>{loc.dialogueType}</label>
        <select value={settings.dialogueType} onChange={updateDialogueType}>
          <option value={DialogueType.Dialogue}>
            {loc.stdialogue_dialogue}
          </option>
          <option value={DialogueType.Intro}>{loc.stdialogue_intro}</option>
          <option value={DialogueType.Caption}>{loc.stdialogue_caption}</option>
          <option value={DialogueType.Full}>{loc.stdialogue_full}</option>
          <option value={DialogueType.Narration}>
            {loc.stdialogue_narration}
          </option>
          <option value={DialogueType.Book}>{loc.stdialogue_book}</option>
        </select>
      </div>

      <div>
        <label>{loc.font}</label>
        <select value={settings.font} onChange={updateFont}>
          <option value="en">{loc.font_en}</option>
          <option value="ja">{loc.font_ja}</option>
          <option value="zh_tw">{loc.font_zh_tw}</option>
          <option value="zh_cn">{loc.font_zh_cn}</option>
        </select>
      </div>

      <div>
        <label>{loc.emotion}</label>
        <select
          id="emotion"
          value={settings.emotion}
          onChange={(e) => updateSettings({ emotion: e.target.value })}
        >
          <option value={Emotion.None}>{loc.emotion_none}</option>
          <option value={Emotion.Anger}>{loc.emotion_anger}</option>
          <option value={Emotion.Bad}>{loc.emotion_bad}</option>
          <option value={Emotion.Exclamation}>{loc.emotion_exclamation}</option>
          <option value={Emotion.Heart}>{loc.emotion_heart}</option>
          <option value={Emotion.Inspiration}>{loc.emotion_inspiration}</option>
          <option value={Emotion.Note}>{loc.emotion_note}</option>
          <option value={Emotion.Notice}>{loc.emotion_notice}</option>
          <option value={Emotion.Question}>{loc.emotion_question}</option>
          <option value={Emotion.Sleep}>{loc.emotion_sleep}</option>
          <option value={Emotion.Sweat}>{loc.emotion_sweat}</option>
        </select>
      </div>

      <div>
        <label>{loc.emotion_side}</label>
        <input
          type="radio"
          id="left"
          name="emotionside"
          checked={settings.emotionIsLeft}
          onChange={() => updateEmotionSide(true)}
        />
        <label htmlFor="left">{loc.left}</label>
        <input
          type="radio"
          id="right"
          name="emotionside"
          checked={!settings.emotionIsLeft}
          onChange={() => updateEmotionSide(false)}
        />
        <label htmlFor="right">{loc.right}</label>
      </div>

      <SliderGroup
        label={loc.emotion_x}
        min={-200}
        max={200}
        step={0.1}
        value={settings.emotionOffsetX}
        onChange={(e) =>
          updateSettings({ emotionOffsetX: parseFloat(e.target.value) })
        }
      />

      <SliderGroup
        label={loc.emotion_y}
        min={-200}
        max={200}
        step={0.1}
        value={settings.emotionOffsetY}
        onChange={(e) =>
          updateSettings({ emotionOffsetY: parseFloat(e.target.value) })
        }
      />

      <div>
        <button className="button" id="download" onClick={downloadImage}>
          {loc.download}
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
