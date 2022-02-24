import { FunctionComponent } from "react";

interface SliderGroupProps {
  label: string | JSX.Element;
  min: number;
  max: number;
  step: number;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

const SliderGroup: FunctionComponent<SliderGroupProps> = ({
  label,
  min,
  max,
  step,
  value,
  onChange,
}) => {
  return (
    <div>
      <label>{label}</label>
      <div className="input-group">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default SliderGroup;
