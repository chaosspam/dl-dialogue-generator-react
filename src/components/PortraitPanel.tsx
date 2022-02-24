import "./PortraitPanel.scss";

import { fetchJson, loadImage } from "../helper/helper";
import React, { useEffect, useState, useCallback, useContext } from "react";
import { LanguageContext } from "../context/language-context";
import { LayerModifyProps } from "./LayersPanel";
import { FunctionComponent } from "react";
import { CarouselItem } from "./Carousel";

// Language map for API
const codeMap: {
  [key: string]: "en_us" | "zh_tw" | "zh_cn" | "jp";
} = {
  en: "en_us",
  zh_tw: "zh_tw",
  zh_cn: "zh_cn",
  ja: "jp",
};

interface APIFileList {
  [key: string]: {
    zh_cn: string;
    zh_tw: string;
    en_us: string;
    jp: string;
  };
}

// Portrait drawing data
const PORTRAIT_URL = "https://dlportraits.space/";
const portraitCanvas = document.createElement("canvas");
portraitCanvas.width = 1024;
portraitCanvas.height = 1024;

interface PortraitData {
  name: string;
  face: string;
  mouth: string;
  base: string;
  offset: {
    x: number;
    y: number;
  };
}

const PortraitPanel: FunctionComponent<LayerModifyProps> = ({
  activeLayer,
  updateLayer,
}) => {
  const language = useContext(LanguageContext);
  const portraitLoc = language.loc.portrait;

  const [fileList, setFileList] = useState<APIFileList>({});
  const [faces, setFace] = useState<string[]>([]);
  const [mouthes, setMouth] = useState<string[]>([]);
  const [portraitData, setPortraitData] = useState<PortraitData | null>(null);

  useEffect(() => {
    populatePortraitData();
  }, []);

  const updateDraw = useCallback(
    () => drawPortraitAndRender(portraitData, updateLayer, activeLayer),
    [portraitData]
  );

  useEffect(() => {
    updateDraw();
  }, [portraitData, updateDraw]);

  const options = Object.keys(fileList).map((key) => {
    const name = fileList[key][codeMap[language.code]];
    return <option key={key} value={`${key} ${name}`} data-id={key} />;
  });

  const faceParts = faces.map((face) => {
    const src = PORTRAIT_URL + face.substring(2);
    return (
      <CarouselItem
        key={face}
        src={src}
        alt="Face Part"
        onClick={() => updatePortraitData({ face: src })}
      />
    );
  });

  const mouthParts = mouthes.map((mouth) => {
    const src = PORTRAIT_URL + mouth.substring(2);
    return (
      <CarouselItem
        key={mouth}
        src={src}
        alt="Mouth Part"
        onClick={() => updatePortraitData({ mouth: src })}
      />
    );
  });

  return (
    <div id="portraitPanel">
      <h3>
        {portraitLoc.title}
        <a href="https://dlportraits.space/" target="_blank" rel="noreferrer">
          {portraitLoc.link}
        </a>
        )
      </h3>
      <input
        type="text"
        autoComplete="off"
        list="portraitList"
        onChange={validateDatalistInput}
      />
      <datalist id="portraitList">{options}</datalist>
      <br />

      <label>{portraitLoc.face}</label>
      <hr />
      <div className="image-container">{faceParts}</div>

      <label>{portraitLoc.mouth}</label>
      <hr />
      <div className="image-container">{mouthParts}</div>
    </div>
  );
  /**
   * Fetches data for the available portraits
   */
  async function populatePortraitData() {
    try {
      let portraitData = await fetchJson(
        PORTRAIT_URL + "portrait_output/localizedDirData.json"
      );
      setFileList(portraitData.fileList);
    } catch (e) {
      console.error("Failed to fetch portrait data from dlportrait.space: ", e);
    }
  }

  /**
   * Validates the portrait input to match options in datalist
   */
  function validateDatalistInput(e: React.ChangeEvent<HTMLInputElement>) {
    const option: HTMLOptionElement | null = document.querySelector(
      `#portraitList option[value='${e.currentTarget.value}']`
    );
    if (option !== null) {
      loadSelectedPortraitData(option.dataset.id, e.currentTarget.value);
    }
  }

  /**
   * Gets data about the portrait of the character with the given id
   * @param {string | undefined} charId - id of the character
   * @param {string} characterName - localized name of the character
   */
  async function loadSelectedPortraitData(
    charId: string | undefined,
    characterName: string
  ) {
    try {
      let data = await fetchJson(
        PORTRAIT_URL + `portrait_output/${charId}/data.json`
      );

      let faceURL = "";
      if (data.partsData.faceParts[0] !== undefined) {
        faceURL = PORTRAIT_URL + data.partsData.faceParts[0].substring(2);
      }

      let mouthURL = "";
      if (data.partsData.mouthParts[0] !== undefined) {
        mouthURL = PORTRAIT_URL + data.partsData.mouthParts[0].substring(2);
      }

      setFace(data.partsData.faceParts);
      setMouth(data.partsData.mouthParts);
      setPortraitData({
        name: characterName,
        face: faceURL,
        mouth: mouthURL,
        base: PORTRAIT_URL + `portrait_output/${charId}/${charId}_base.png`,
        offset: data.offset,
      });
    } catch (e) {
      console.error("Failed to fetch selected data from dlportrait.space: ", e);
    }
  }

  async function updatePortraitData(updatedValue: any) {
    setPortraitData(Object.assign({}, portraitData, updatedValue));
  }
};

/**
 * Draws the portrait on the portrait canvas and sets the image source of the
 * current tab to the portrait canvas
 * @param portraitData {PortraitData | null}
 * @param updateLayer {(updateLayerId: number | undefined, updated: any) => void}
 * @param activeLayer {number} - Active Layer
 */
async function drawPortraitAndRender(
  portraitData: PortraitData | null,
  updateLayer: (updateLayerId: number | undefined, updated: any) => void,
  activeLayer: number
) {
  if (portraitData === null) return;
  const ctx = portraitCanvas.getContext("2d");
  if (ctx !== null) {
    ctx.clearRect(0, 0, portraitCanvas.width, portraitCanvas.height);

    const baseImage = await loadImage(portraitData.base);
    ctx.drawImage(baseImage, 0, 0);

    if (portraitData.face !== "") {
      const faceImage = await loadImage(portraitData.face);
      ctx.drawImage(faceImage, portraitData.offset.x, portraitData.offset.y);
    }

    if (portraitData.mouth !== "") {
      const mouthImage = await loadImage(portraitData.mouth);
      ctx.drawImage(mouthImage, portraitData.offset.x, portraitData.offset.y);
    }

    const blob: any = await new Promise((resolve) =>
      portraitCanvas.toBlob(resolve)
    );
    const url = URL.createObjectURL(blob);

    updateLayer(activeLayer, { src: url, offsetY: 70, scale: 1.175 });
  }
}

export default PortraitPanel;
