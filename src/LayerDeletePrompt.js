import './LayerDeletePrompt.css';

function LayerDeletePrompt({ active, loc, removeLayer, closePrompt }) {
  return (
    <div className={`layer-delete-prompt ${active ? '' : 'hidden'}`}>
      <div>
        <p>{loc.deleteLayerConfirm}</p>
        <button className='button delete' onClick={() => { removeLayer(); closePrompt(); }}>{loc.delete}</button>
        <button className='button' onClick={closePrompt}>{loc.cancel}</button>
      </div>
    </div>
  );
}

export default LayerDeletePrompt;