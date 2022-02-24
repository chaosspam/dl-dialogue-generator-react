export const enum Emotion {
  None = "none",
  Anger = "anger",
  Bad = "bad",
  Exclamation = "exclamation",
  Heart = "heart",
  Inspiration = "inspiration",
  Note = "note",
  Notice = "notice",
  Question = "question",
  Sleep = "sleep",
  Sweat = "sweat",
}

export const enum DialogueType {
  Dialogue = "dialogue",
  Intro = "intro",
  Caption = "caption",
  Full = "full",
  Narration = "narration",
  Book = "book",
}

export interface Layer {
  name?: string;
  id?: number;
  image: HTMLImageElement;
  src?: string;
  offsetX: number;
  offsetY: number;
  rotation?: number;
  scale?: number;
  opacity?: number;
  flipX?: boolean;
  filter?: string;
}

export interface Settings {
  speaker: string;
  dialogueText: string;
  dialogueType: DialogueType;
  font: string;
  emotion: Emotion;
  emotionIsLeft: boolean;
  emotionOffsetX: number;
  emotionOffsetY: number;
}

export interface TextProperties {
  bookYPos: number;
  captionSize: number;
  captionYPos: number;
  fontWeight?: number | string;
  dialogueSize: number;
  dialogueXPos: number;
  dialogueYPos: number;
  introNameSize: number;
  introNameYPos: number;
  introTitleSize: number;
  introTitleYPos: number;
  introXPos: number;
  lineHeight: number;
  nameSize: number;
  narrationLineHeight: number;
  narrationYPos: number;
  speakerXPos: number;
  speakerYPos: number;
  titleSize: number;
  titleYPos: number;
}
