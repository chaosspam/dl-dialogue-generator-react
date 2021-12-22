import './PortraitPanel.css';
import React from "react";
import i18n from './data/i18n.json';
import { fetchJson, loadImage } from './Helper.js';

// Portrait drawing data
const PORTRAIT_URL = "https://dlportraits.space/";
let portraitCanvas;

class PortraitPanel extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      fileList: {},
      face: [],
      mouth: [],
      portraitData: {}
    };

    portraitCanvas = document.createElement("canvas");
    portraitCanvas.width = 1024;
    portraitCanvas.height = 1024;

    this.validateDatalistInput = this.validateDatalistInput.bind(this);
    this.updatePortraitData = this.updatePortraitData.bind(this);
  }

  componentDidMount() {
    this.populatePortraitData();
  }

  render() {
    const { loc, pageLang } = this.props

    const options = Object.keys(this.state.fileList).map(key => {
      const name = this.state.fileList[key][i18n[pageLang].code];
      return <option key={key} value={`${key} ${name}`} data-id={key} />
    });

    const faceParts = this.state.face.map(face => {
      return <FacePartImage key={face} src={PORTRAIT_URL + face.substring(2)} updatePortraitData={this.updatePortraitData} />
    });

    const mouthParts = this.state.mouth.map(mouth => {
      return <MouthPartImage key={mouth} src={PORTRAIT_URL + mouth.substring(2)} updatePortraitData={this.updatePortraitData} />
    });

    return (
      <div id="portraitPanel" className={`${this.props.active ? '' : 'hidden'}`}>
        <h3>{loc.title}<a href="https://dlportraits.space/" target="_blank" rel="noreferrer">{loc.link}</a>)</h3>
        <input type="text" autoComplete="off" list="portraitList" onChange={this.validateDatalistInput} />
        <datalist id="portraitList">
          {options}
        </datalist>
        <br />
        <label>{loc.face}</label>
        <hr />
        <div className='image-container'>
          {faceParts}
        </div>
        <label>{loc.mouth}</label>
        <hr />
        <div className='image-container'>
          {mouthParts}
        </div>
      </div>
    );
  }

  /**
   * Fetches data for the available portraits
   */
  async populatePortraitData() {
    let portraitData = await fetchJson(PORTRAIT_URL + "portrait_output/localizedDirData.json");
    this.setState({ fileList: portraitData.fileList });
  }

  /**
   * Validates the portrait input to match options in datalist
   */
  validateDatalistInput(e) {
    let option = document.querySelector(`#portraitList option[value="${e.target.value}"]`);
    if (option !== null) {
      this.loadSelectedPortraitData(option.dataset.id, e.target.value);
    }
  }

  /**
   * Gets data about the portrait of the character with the given id
   * @param {string} charId - id of the character
   */
  async loadSelectedPortraitData(charId, characterName) {
    let data = await fetchJson(PORTRAIT_URL + `portrait_output/${charId}/data.json`);

    let faceURL = '';
    if(data.partsData.faceParts[0] !== undefined) {
      faceURL = PORTRAIT_URL + data.partsData.faceParts[0].substring(2);
    }

    let mouthURL = '';
    if(data.partsData.mouthParts[0] !== undefined) {
      mouthURL = PORTRAIT_URL + data.partsData.mouthParts[0].substring(2);
    }

    this.setState({
      face: data.partsData.faceParts,
      mouth: data.partsData.mouthParts,
      portraitData: {
        name: characterName,
        face: faceURL,
        mouth: mouthURL,
        base: PORTRAIT_URL + `portrait_output/${charId}/${charId}_base.png`,
        offset: data.offset,
      }
    }, this.drawPortraitAndRender);
  }

  /**
   * Draws the portrait on the portrait canvas and sets the image source of the
   * current tab to the portrait canvas
   */
  async drawPortraitAndRender() {
    const ctx = portraitCanvas.getContext("2d");
    ctx.clearRect(0, 0, portraitCanvas.width, portraitCanvas.height);

    const baseImage = await loadImage(this.state.portraitData.base);
    ctx.drawImage(baseImage, 0, 0);

    if (this.state.portraitData.face !== "") {
      const faceImage = await loadImage(this.state.portraitData.face);
      ctx.drawImage(faceImage, this.state.portraitData.offset.x, this.state.portraitData.offset.y);
    }

    if (this.state.portraitData.mouth !== "") {
      const mouthImage = await loadImage(this.state.portraitData.mouth);
      ctx.drawImage(mouthImage, this.state.portraitData.offset.x, this.state.portraitData.offset.y);
    }

    const blob = await new Promise(resolve => portraitCanvas.toBlob(resolve));
    const url = URL.createObjectURL(blob);

    this.props.updateLayer(this.props.activeLayer, { image: url, offsetY: 70, scale: 1.175 });
  }

  async updatePortraitData(updatedValue) {
    this.setState(prevState => { return { portraitData: Object.assign(prevState.portraitData, updatedValue) }; }, this.drawPortraitAndRender);
  }
}

function FacePartImage(props) {
  return <img src={props.src} onClick={() => props.updatePortraitData({ face: props.src })} alt='Face Part' />
}

function MouthPartImage(props) {
  return <img src={props.src} onClick={() => props.updatePortraitData({ mouth: props.src })} alt='Mouth Part' />
}

export default PortraitPanel;