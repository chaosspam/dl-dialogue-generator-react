import { FunctionComponent, useContext } from "react";
import { LanguageContext } from "../context/language-context";
import { Carousel, CarouselItem } from "./Carousel";
import { LayerModifyProps } from "./LayersPanel";
import backgroundData from "../data/background_data.json";

const THUMB_URL = "https://dragalialost.wiki/thumb.php?width=75&f=";
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
      <div>
        <label>{loc.full}</label>
        <hr />
        <Carousel items={backgroundItems} carouselSize={CAROUSEL_SIZE} />
        <label>{loc.skybox}</label>
        <hr />
        <Carousel items={skyboxItems} carouselSize={CAROUSEL_SIZE} />
        <label>{loc.cloud}</label>
        <hr />
        <Carousel items={cloudItems} carouselSize={CAROUSEL_SIZE} />
        <label>{loc.overlay}</label>
        <hr />
        <Carousel items={overlayItems} carouselSize={CAROUSEL_SIZE} />
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
        src={THUMB_URL + image.fileName}
        alt={image.fileName}
        onClick={onClick}
      />
    );
  });
}

export default BackgroundPanel;
