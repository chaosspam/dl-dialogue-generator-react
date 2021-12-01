import React from 'react';
import data from './data/background_data.json';

const THUMB_URL = 'https://dragalialost.wiki/thumb.php?width=75&f='
const CarouselSize = 12;

class BackgroundPanel extends React.Component {
  constructor(props) {
    super(props);

    let newData = {}
    for(let i = 0; i < data.length; i++) {
      if(newData[data[i].type] === undefined) {
        newData[data[i].type] = [];
      }
      newData[data[i].type].push(data[i]);
    }

    this.state = {
      backgroundData: newData
    }
  }

  render() {
    const { loc } = this.props;
    return (
      <div id="backgroundPanel" className={`${this.props.active ? '' : 'hidden'}`}>
        <h3>{loc.title}<a href="https://dragalialost.wiki/w/Category:Background_Art" target="_blank" rel="noreferrer">{loc.link}</a>)</h3>
        <div>
          <label>{loc.full}</label>
          <hr />
          <BackgroundCarousel images={this.state.backgroundData.background} activeLayer={this.props.activeLayer} updateLayer={this.props.updateLayer} />
          <label>{loc.skybox}</label>
          <hr />
          <BackgroundCarousel images={this.state.backgroundData.skybox} activeLayer={this.props.activeLayer} updateLayer={this.props.updateLayer} />
          <label>{loc.cloud}</label>
          <hr />
          <BackgroundCarousel images={this.state.backgroundData.cloud} activeLayer={this.props.activeLayer} updateLayer={this.props.updateLayer} />
          <label>{loc.overlay}</label>
          <hr />
          <BackgroundCarousel images={this.state.backgroundData.overlay} activeLayer={this.props.activeLayer} updateLayer={this.props.updateLayer} />
        </div>
      </div>
    );
  }
}


class BackgroundCarousel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0
    };

    this.previousPage = this.previousPage.bind(this);
    this.nextPage = this.nextPage.bind(this);
  }

  render() {
    const backgroundImages = this.props.images.slice(this.state.index, this.state.index + CarouselSize).map(image => {
      return (
        <img
          key={image.fileName}
          src={THUMB_URL + image.fileName}
          data-full-src={image.url}
          onClick={() => this.props.updateLayer(this.props.activeLayer, { image: image.url })}
          alt='Background'
        />
      );
    });

    return (
      <div className="carousel">
        <button className="button" onClick={this.previousPage}>&lt;</button>
          <div className="image-container">
            {backgroundImages}
          </div>
        <button className="button" onClick={this.nextPage}>&gt;</button>
      </div>
    );
  }

  previousPage() {
    this.setState((prevState) => {
      let newIndex = prevState.index - CarouselSize;
      if(newIndex < 0) {
        newIndex = 0;
      }
      return { index: newIndex };
    });
  }

  nextPage() {
    this.setState((prevState) => {
      let newIndex = prevState.index + CarouselSize;
      if(newIndex >= this.props.images.length) {
        return { index: prevState.index };
      } else {
        return { index: newIndex };
      }
    });
  }
}

export default BackgroundPanel;