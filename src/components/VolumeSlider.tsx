import { faVolumeUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  FunctionComponent,
  MutableRefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { LanguageContext } from "../context/language-context";

const VolumeSlider: FunctionComponent = () => {
  const [volume, setVolume] = useState(0);
  const language = useContext(LanguageContext);
  const audioSource: MutableRefObject<null | HTMLAudioElement> = useRef(null);

  const startPlaying = () => {
    if (!audioSource || !audioSource.current) {
      audioSource.current = new Audio("ngn.wav");
      audioSource.current.loop = true;
    }
    audioSource.current.play();
  };

  useEffect(() => {
    if (audioSource && audioSource.current) {
      audioSource.current.volume = volume;

      if (volume === 0) {
        audioSource.current.pause();
      } else {
        audioSource.current.play();
      }
    }
  }, [volume]);

  return (
    <div>
      <label>
        <FontAwesomeIcon icon={faVolumeUp} /> {language.loc.layers.volume}
      </label>
      <div className="input-group">
        <input
          type="number"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.currentTarget.value))}
          onClickCapture={startPlaying}
          onTouchStartCapture={startPlaying}
        />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.currentTarget.value))}
          onClickCapture={startPlaying}
          onTouchStartCapture={startPlaying}
        />
      </div>
    </div>
  );
};

export default VolumeSlider;
