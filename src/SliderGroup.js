export default function SliderGroup({ label, min, max, step, value, onChange }) {
  return (
    <div>
      <label>{label}</label>
      <div className='input-group'>
        <input type='number' min={min} max={max} step={step} value={value} onChange={onChange} />
        <input type='range' min={min} max={max} step={step} value={value} onChange={onChange} />
      </div>
    </div>
  );
}
