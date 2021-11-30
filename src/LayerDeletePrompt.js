import './LayerDeletePrompt.css';
import React from 'react';

function LayerDeletePrompt (props) {
  return (
    <div className={`layer-delete-prompt ${props.active ? '' : 'hidden'}`}>
      <div>
        <p>Are you sure you want to delete this layer?</p>
        <button className='button delete' onClick={() => { props.removeLayer(); props.closePrompt(); } }>Delete</button>
        <button className='button' onClick={props.closePrompt}>Cancel</button>
      </div>
    </div>
  );
}

export default LayerDeletePrompt;