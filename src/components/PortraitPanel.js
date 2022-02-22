import './PortraitPanel.css';

import { fetchJson, loadImage } from '../helper/helper.js';
import { useEffect, useState, useCallback, useContext } from 'react';
import { LanguageContext } from '../context/language-context';

// Portrait drawing data
const PORTRAIT_URL = 'https://dlportraits.space/';
const portraitCanvas = document.createElement('canvas');
const codeMap = {
  en: "en_us",
  zh_tw: "zh_tw",
  zh_cn: "zh_cn",
  ja: "jp"
}
portraitCanvas.width = 1024;
portraitCanvas.height = 1024;

function PortraitPanel({ active, updateLayer, activeLayer }) {

  const language = useContext(LanguageContext);
  const portraitLoc = language.loc.portrait;

  const [fileList, setFileList] = useState({});
  const [face, setFace] = useState([]);
  const [mouth, setMouth] = useState([]);
  const [portraitData, setPortraitData] = useState(null);

  useEffect(() => {
    populatePortraitData();
  }, []);

  const updateDraw = useCallback(() => drawPortraitAndRender(portraitData, updateLayer, activeLayer), [portraitData]);

  useEffect(() => {
    updateDraw();
  }, [portraitData, updateDraw]);

  const options = Object.keys(fileList).map(key => {
    const name = fileList[key][codeMap[language.code]];
    return <option key={key} value={`${key} ${name}`} data-id={key} />
  });

  const faceParts = face.map(face => {
    return <FacePartImage key={face} src={PORTRAIT_URL + face.substring(2)} updatePortraitData={updatePortraitData} />
  });

  const mouthParts = mouth.map(mouth => {
    return <MouthPartImage key={mouth} src={PORTRAIT_URL + mouth.substring(2)} updatePortraitData={updatePortraitData} />
  });

  return (
    <div id='portraitPanel' className={active ? undefined : 'hidden'}>

      <h3>{portraitLoc.title}<a href='https://dlportraits.space/' target='_blank' rel='noreferrer'>{portraitLoc.link}</a>)</h3>
      <input type='text' autoComplete='off' list='portraitList' onChange={validateDatalistInput} />
      <datalist id='portraitList'>
        {options}
      </datalist>
      <br />

      <label>{portraitLoc.face}</label>
      <hr />
      <div className='image-container'>{faceParts}</div>

      <label>{portraitLoc.mouth}</label>
      <hr />
      <div className='image-container'>{mouthParts}</div>
    </div>
  );
  /**
   * Fetches data for the available portraits
   */
  async function populatePortraitData() {
    try {
      let portraitData = await fetchJson(PORTRAIT_URL + 'portrait_output/localizedDirData.json');
      setFileList(portraitData.fileList);
    } catch (e) {
      console.error('Failed to fetch portrait data from dlportrait.space: ', e);
    }
  }

  /**
   * Validates the portrait input to match options in datalist
   */
  function validateDatalistInput(e) {
    let option = document.querySelector(`#portraitList option[value='${e.target.value}']`);
    if (option !== null) {
      loadSelectedPortraitData(option.dataset.id, e.target.value);
    }
  }

  /**
   * Gets data about the portrait of the character with the given id
   * @param {string} charId - id of the character
   */
  async function loadSelectedPortraitData(charId, characterName) {
    try {
      let data = await fetchJson(PORTRAIT_URL + `portrait_output/${charId}/data.json`);

      let faceURL = '';
      if (data.partsData.faceParts[0] !== undefined) {
        faceURL = PORTRAIT_URL + data.partsData.faceParts[0].substring(2);
      }

      let mouthURL = '';
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
      console.error('Failed to fetch selected data from dlportrait.space: ', e);
    }
  }

  async function updatePortraitData(updatedValue) {
    setPortraitData(Object.assign({}, portraitData, updatedValue));
  }
}

/**
 * Draws the portrait on the portrait canvas and sets the image source of the
 * current tab to the portrait canvas
 */
async function drawPortraitAndRender(portraitData, updateLayer, activeLayer) {
  if (portraitData === null) return;

  const ctx = portraitCanvas.getContext('2d');
  ctx.clearRect(0, 0, portraitCanvas.width, portraitCanvas.height);

  const baseImage = await loadImage(portraitData.base);
  ctx.drawImage(baseImage, 0, 0);

  if (portraitData.face !== '') {
    const faceImage = await loadImage(portraitData.face);
    ctx.drawImage(faceImage, portraitData.offset.x, portraitData.offset.y);
  }

  if (portraitData.mouth !== '') {
    const mouthImage = await loadImage(portraitData.mouth);
    ctx.drawImage(mouthImage, portraitData.offset.x, portraitData.offset.y);
  }

  const blob = await new Promise(resolve => portraitCanvas.toBlob(resolve));
  const url = URL.createObjectURL(blob);

  updateLayer(activeLayer, { src: url, offsetY: 70, scale: 1.175 });
}



function FacePartImage({ src, updatePortraitData }) {
  return <img src={src} onClick={() => updatePortraitData({ face: src })} alt='Face Part' />
}

function MouthPartImage({ src, updatePortraitData }) {
  return <img src={src} onClick={() => updatePortraitData({ mouth: src })} alt='Mouth Part' />
}

export default PortraitPanel;