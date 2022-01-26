import { useState } from 'react';
import data from './data/background_data.json';

const THUMB_URL = 'https://dragalialost.wiki/thumb.php?width=75&f='
const CAROUSEL_SIZE = 12;

const backgroundData = {};

for (let i = 0; i < data.length; i++) {
  if (backgroundData[data[i].type] === undefined) {
    backgroundData[data[i].type] = [];
  }
  backgroundData[data[i].type].push(data[i]);
}

export default function BackgroundPanel({ loc, active, activeLayer, updateLayer }) {


  return (
    <div id="backgroundPanel" className={active ? undefined : 'hidden'}>
      <h3>{loc.title}<a href="https://dragalialost.wiki/w/Category:Background_Art" target="_blank" rel="noreferrer">{loc.link}</a>)</h3>
      <div>
        <label>{loc.full}</label>
        <hr />
        <BackgroundCarousel images={backgroundData.background} activeLayer={activeLayer} updateLayer={updateLayer} />
        <label>{loc.skybox}</label>
        <hr />
        <BackgroundCarousel images={backgroundData.skybox} activeLayer={activeLayer} updateLayer={updateLayer} />
        <label>{loc.cloud}</label>
        <hr />
        <BackgroundCarousel images={backgroundData.cloud} activeLayer={activeLayer} updateLayer={updateLayer} />
        <label>{loc.overlay}</label>
        <hr />
        <BackgroundCarousel images={backgroundData.overlay} activeLayer={activeLayer} updateLayer={updateLayer} />
      </div>
    </div>
  );
}


function BackgroundCarousel({ images, activeLayer, updateLayer }) {
  const [index, setIndex] = useState(0);

  const backgroundImages = images.slice(index, index + CAROUSEL_SIZE).map(image => {
    return <BackgroundCarouselItem
      key={image.fileName}
      image={image}
      activeLayer={activeLayer}
      updateLayer={updateLayer}
    />;
  });

  return (
    <div className="carousel">
      <button className="button" onClick={() => setIndex(prev())}>&lt;</button>
      <div className="image-container">
        {backgroundImages}
      </div>
      <button className="button" onClick={() => setIndex(next())}>&gt;</button>
    </div>
  );

  function prev() {
    let newIndex = index - CAROUSEL_SIZE;
    if (newIndex < 0) {
      newIndex = 0;
    }
    return newIndex;
  }

  function next() {
    let newIndex = index + CAROUSEL_SIZE;
    if (newIndex >= images.length) {
      return index;
    } else {
      return newIndex;
    }
  }
}

function BackgroundCarouselItem({ image, updateLayer, activeLayer }) {
  return (
    <img
      src={THUMB_URL + image.fileName}
      data-full-src={image.url}
      onClick={() => updateLayer(activeLayer, defaultSettings(image))}
      alt='Background'
    />
  );

  function defaultSettings(image) {
    return { image: image.url, offsetY: 65, scale: 1.2 };
  }
}

