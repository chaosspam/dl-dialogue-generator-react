import './LayerDeletePrompt.css';
import React from 'react';

function LayerDeletePrompt(props) {
  return (
    <div className={`layer-delete-prompt ${props.active ? '' : 'hidden'}`}>
      <div>
        <p>{props.loc.deleteLayerConfirm}</p>
        <button className='button delete' onClick={() => { props.removeLayer(); props.closePrompt(); }}>{props.loc.delete}</button>
        <button className='button' onClick={props.closePrompt}>{props.loc.cancel}</button>
      </div>
    </div>
  );
}

export default LayerDeletePrompt;