import { FunctionComponent, useContext } from "react";
import { LanguageContext } from "../context/language-context";
import { Carousel, CarouselItem } from "./Carousel";
import { LayerModifyProps } from "./LayersPanel";
import backgroundData from "../data/background_data.json";

const THUMB_URL = "images/background_images/downsized/";
const CAROUSEL_SIZE = 12;

interface BackgroundItem {
  fileName: string;
  url: string;
}

const BackgroundPanel: FunctionComponent<LayerModifyProps> = ({
  activeLayer,
  updateLayer,
}) => {
  const language = useContext(LanguageContext);
  const loc = language.loc.background;
  const backgroundItems = getBackgroundItems(
    backgroundData.background,
    activeLayer,
    updateLayer
  );
  const skyboxItems = getBackgroundItems(
    backgroundData.skybox,
    activeLayer,
    updateLayer
  );
  const cloudItems = getBackgroundItems(
    backgroundData.cloud,
    activeLayer,
    updateLayer
  );
  const overlayItems = getBackgroundItems(
    backgroundData.overlay,
    activeLayer,
    updateLayer
  );

  return (
    <div id="backgroundPanel">
      <h3>
        {loc.title}
        <a
          href="https://dragalialost.wiki/w/Category:Background_Art"
          target="_blank"
          rel="noreferrer"
        >
          {loc.link}
        </a>
        )
      </h3>
      <h3>
        <a href="tagger.html">Help me tag background images!</a>
      </h3>
      <div>
        <label>{loc.full}</label>
        <hr />
        <Carousel items={backgroundItems} carouselSize={CAROUSEL_SIZE} />
        <details>
          <summary>{loc.skybox}<hr /></summary>
          <Carousel items={skyboxItems} carouselSize={CAROUSEL_SIZE} />
        </details>
        <details>
          <summary>{loc.cloud}<hr /></summary>
          <Carousel items={cloudItems} carouselSize={CAROUSEL_SIZE} />
        </details>
        <details>
          <summary>{loc.overlay}<hr /></summary>
          <Carousel items={overlayItems} carouselSize={CAROUSEL_SIZE} />
        </details>
      </div>
    </div>
  );
};

function defaultSettings(image: BackgroundItem) {
  return { src: image.url, offsetY: 65, scale: 1.2 };
}

function getBackgroundItems(
  images: BackgroundItem[],
  activeLayer: number,
  updateLayer: (updateLayerId: number | undefined, updated: any) => void
) {
  return images.map((image) => {
    const onClick = () => updateLayer(activeLayer, defaultSettings(image));
    return (
      <CarouselItem
        key={image.fileName}
        src={`${THUMB_URL}${image.fileName}.webp`}
        alt={image.fileName}
        onClick={onClick}
      />
    );
  });
}

export default BackgroundPanel;
