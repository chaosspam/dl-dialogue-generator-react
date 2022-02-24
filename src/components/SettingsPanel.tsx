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

  function updateDialogueType(e: React.ChangeEvent<HTMLInputElement>) {
    updateSettings({ dialogueType: e.currentTarget.value });
  }

  function updateFont(e: React.ChangeEvent<HTMLInputElement>) {
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
        <input
          type="radio"
          name="stdialogue"
          value={DialogueType.Dialogue}
          id="std-dialogue"
          checked={settings.dialogueType === DialogueType.Dialogue}
          onChange={updateDialogueType}
        />
        <label htmlFor="std-dialogue">{loc.stdialogue_dialogue}</label>
        <input
          type="radio"
          name="stdialogue"
          value={DialogueType.Intro}
          id="std-intro"
          checked={settings.dialogueType === DialogueType.Intro}
          onChange={updateDialogueType}
        />
        <label htmlFor="std-intro">{loc.stdialogue_intro}</label>
        <input
          type="radio"
          name="stdialogue"
          value={DialogueType.Caption}
          id="std-caption"
          checked={settings.dialogueType === DialogueType.Caption}
          onChange={updateDialogueType}
        />
        <label htmlFor="std-caption">{loc.stdialogue_caption}</label>
        <br />
        <input
          type="radio"
          name="stdialogue"
          value={DialogueType.Full}
          id="std-full"
          checked={settings.dialogueType === DialogueType.Full}
          onChange={updateDialogueType}
        />
        <label htmlFor="std-full">{loc.stdialogue_full}</label>
        <input
          type="radio"
          name="stdialogue"
          value={DialogueType.Narration}
          id="std-narration"
          checked={settings.dialogueType === DialogueType.Narration}
          onChange={updateDialogueType}
        />
        <label htmlFor="std-narration">{loc.stdialogue_narration}</label>
        <input
          type="radio"
          name="stdialogue"
          value={DialogueType.Book}
          id="std-book"
          checked={settings.dialogueType === DialogueType.Book}
          onChange={updateDialogueType}
        />
        <label htmlFor="std-book">{loc.stdialogue_book}</label>
      </div>

      <div>
        <label>{loc.font}</label>
        <input
          type="radio"
          id="en"
          name="font"
          value="en"
          checked={settings.font === "en"}
          onChange={updateFont}
        />
        <label htmlFor="en">{loc.font_en}</label>
        <input
          type="radio"
          id="jp"
          name="font"
          value="ja"
          checked={settings.font === "ja"}
          onChange={updateFont}
        />
        <label htmlFor="jp">{loc.font_ja}</label>
        <br />
        <input
          type="radio"
          id="zh_tw"
          name="font"
          value="zh_tw"
          checked={settings.font === "zh_tw"}
          onChange={updateFont}
        />
        <label htmlFor="zh_tw">{loc.font_zh_tw}</label>
        <input
          type="radio"
          id="zh_cn"
          name="font"
          value="zh_cn"
          checked={settings.font === "zh_cn"}
          onChange={updateFont}
        />
        <label htmlFor="zh_cn">{loc.font_zh_cn}</label>
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
