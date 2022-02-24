import { FunctionComponent, useState } from "react";

interface CarouselProps {
  items: JSX.Element[];
  carouselSize: number;
}

export const Carousel: FunctionComponent<CarouselProps> = ({
  items,
  carouselSize,
}) => {
  const [index, setIndex] = useState(0);

  const backgroundImages = items.slice(index, index + carouselSize);

  function prev() {
    let newIndex = index - carouselSize;
    if (newIndex < 0) {
      newIndex = 0;
    }
    return newIndex;
  }

  function next() {
    let newIndex = index + carouselSize;
    if (newIndex >= items.length) {
      return index;
    } else {
      return newIndex;
    }
  }

  return (
    <div className="carousel">
      <button className="button" onClick={() => setIndex(prev())}>
        &lt;
      </button>
      <div className="image-container">{backgroundImages}</div>
      <button className="button" onClick={() => setIndex(next())}>
        &gt;
      </button>
    </div>
  );
};

interface CarouselItemProps {
  src: string;
  alt: string;
  onClick: React.MouseEventHandler<HTMLImageElement> | undefined;
}

export const CarouselItem: FunctionComponent<CarouselItemProps> = ({
  src,
  alt,
  onClick,
}) => {
  return <img src={src} alt={alt} onClick={onClick} />;
};
