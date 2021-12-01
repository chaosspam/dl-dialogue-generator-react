import './LayersPanel.css';
import PortraitPanel from './PortraitPanel.js';
import BackgroundPanel from './BackgroundPanel.js';
import LayerDeletePrompt from './LayerDeletePrompt.js';
import React, { useRef, useEffect, useState } from 'react';
import { DndContext, useSensor, useSensors, MouseSensor, TouchSensor, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { restrictToWindowEdges, snapCenterToCursor } from '@dnd-kit/modifiers';
import i18n from './data/i18n.json';

const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function LayersPanel(props) {
  const { layers, drawDialogueScreen, addLayer, removeLayer, updateLayer, reorderLayer, pageLang } = props;
  const [activeTabId, setActiveTab] = useState(2);
  const [portraitPanelActive, setPortraitPanelActive] = useState(false);
  const [backgroundPanelActive, setBackgroundPanelActive] = useState(false);
  const [deletePanelActive, setDeletePanelActive] = useState(false);
  const loc = i18n[pageLang].loc.layers

  const prevLayers = usePrevious(layers);

  useEffect(() => {
    if (layers && layers.length > 0 && prevLayers && prevLayers.length !== layers.length) {
      setActiveTab(layers[layers.length - 1].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers]);

  const togglePortraitPanel = () => {
    setPortraitPanelActive(!portraitPanelActive);
    setBackgroundPanelActive(false);
  }

  const toggleBackgroundPanel = () => {
    setBackgroundPanelActive(!backgroundPanelActive);
    setPortraitPanelActive(false);
  }

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    }
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      distance: 5,
    }
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const items = [];

  const tabContents = layers.map(
    (lyr) => {
      items.push(`tab_${lyr.id}`);
      return <LayerTabPane
        key={lyr.id}
        layer={lyr}
        active={lyr.id === activeTabId}
        drawDialogueScreen={drawDialogueScreen}
        togglePortraitPanel={togglePortraitPanel}
        toggleBackgroundPanel={toggleBackgroundPanel}
        openPrompt={() => setDeletePanelActive(true)}
        portraitPanelActive={portraitPanelActive}
        backgroundPanelActive={backgroundPanelActive}
        updateLayer={updateLayer}
        loc={loc}
      />;
    }
  );

  const tabs = tabContents.map(
    (tabContent, index) =>
      <LayerTab
        key={`tab_${tabContent.props.layer.id}`}
        layer={tabContent.props.layer}
        onClick={setActiveTab}
        activeTab={tabContent.props.layer.id === activeTabId}
        index={index}
      />
  );

  return (
    <DndContext sensors={sensors} onDragEnd={reorderLayer} collisionDetection={closestCenter} modifiers={[snapCenterToCursor, restrictToWindowEdges]}>
      <div>
        <ul className='tab-bar'>
          <SortableContext items={items} strategy={rectSortingStrategy}>
            {tabs}
          </SortableContext>
          <li onClick={addLayer} id='addLayer'>+</li>
        </ul>
        <div>
          {tabContents}
        </div>
        <PortraitPanel
          active={portraitPanelActive}
          activeLayer={activeTabId}
          updateLayer={updateLayer}
          loc={i18n[pageLang].loc.portrait}
          pageLang={pageLang}
        />
        <BackgroundPanel
          active={backgroundPanelActive}
          activeLayer={activeTabId}
          updateLayer={updateLayer}
          loc={i18n[pageLang].loc.background}
        />
      </div>
      <LayerDeletePrompt
        active={deletePanelActive}
        removeLayer={() => removeLayer(activeTabId)}
        closePrompt={() => setDeletePanelActive(false)}
        loc={i18n[pageLang].loc}
      />
    </DndContext>
  );
}

function LayerTab(props) {
  const { activeTab, layer, onClick } = props;

  const { active, attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: `tab_${layer.id}`,
    data: {
      index: props.index
    }
  });

  const isActive = active !== null && (active.id === `tab_${layer.id}`);

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition
  };


  return (
    <li
      ref={setNodeRef}
      style={style}
      onClick={() => { onClick(layer.id) }}
      {...listeners}
      {...attributes}
      id={`tab_${layer.id}`}
      className={`${activeTab ? 'active' : ''} ${isActive ? 'dragging' : ''}`}
    >
      {layer.name.substring(0, 10)}
    </li>
  );
}

function LayerTabPane(props) {
  const {
    loc, layer, updateLayer, portraitPanelActive, backgroundPanelActive,
    togglePortraitPanel, toggleBackgroundPanel, openPrompt, drawDialogueScreen,
    active
  } = props;
  return (
    <div className={`tab ${active ? 'active' : ''}`}>
      <div>
        <h2>{loc.layerImage}</h2>
        <label>{loc.reccomendedSize}</label>
        <img src={layer.image} alt='Layer' id={`img_${layer.id}`} onLoad={drawDialogueScreen} crossOrigin="anonymous"/>
        <input type='file' accept='image/*' onChange={e => { updateLayer(layer.id, { image: window.URL.createObjectURL(e.target.files[0]) }); }} />
        <button className='button delete' onClick={openPrompt}>{loc.deleteLayer}</button>
        <button className={`button ${portraitPanelActive ? 'selected' : ''}`} onClick={togglePortraitPanel}>{loc.portrait}</button>
        <button className={`button ${backgroundPanelActive ? 'selected' : ''}`} onClick={toggleBackgroundPanel}>{loc.background}</button>
      </div>
      <div>
        <div>
          <label>{loc.layerName}</label>
          <input type='text' placeholder={loc.layerName} defaultValue={layer.name} onChange={e => { updateLayer(layer.id, { name: e.target.value }); }} />
        </div>
        <div>
          <label>{loc.opacity}</label>
          <div className='input-group'>
            <input type='number' min='0' max='1' step='0.01' value={layer.opacity} onChange={e => { updateLayer(layer.id, { opacity: e.target.value }); }} />
            <input type='range' min='0' max='1' step='0.01' value={layer.opacity} onChange={e => { updateLayer(layer.id, { opacity: e.target.value }); }} />
          </div>
        </div>
        <div>
          <label>{loc.offsetX}</label>
          <div className='input-group'>
            <input type='number' min='-400' max='400' step='1' value={layer.offsetX} onChange={e => { updateLayer(layer.id, { offsetX: e.target.value }); }} />
            <input type='range' min='-400' max='400' step='1' value={layer.offsetX} onChange={e => { updateLayer(layer.id, { offsetX: e.target.value }); }} />
          </div>
        </div>
        <div>
          <label>{loc.offsetY}</label>
          <div className='input-group'>
            <input type='number' min='-400' max='400' step='1' value={layer.offsetY} onChange={e => { updateLayer(layer.id, { offsetY: e.target.value }); }} />
            <input type='range' min='-400' max='400' step='1' value={layer.offsetY} onChange={e => { updateLayer(layer.id, { offsetY: e.target.value }); }} />
          </div>
        </div>
        <div>
          <label>{loc.rotation}</label>
          <div className='input-group'>
            <input type='number' min='-180' max='180' step='0.1' value={layer.rotation} onChange={e => { updateLayer(layer.id, { rotation: e.target.value }); }} />
            <input type='range' min='-180' max='180' step='0.1' value={layer.rotation} onChange={e => { updateLayer(layer.id, { rotation: e.target.value }); }} />
          </div>
        </div>
        <div>
          <label>{loc.scale}</label>
          <div className='input-group'>
            <input type='number' min='0' max='3' step='0.1' value={layer.scale} onChange={e => { updateLayer(layer.id, { scale: e.target.value }); }} />
            <input type='range' min='0' max='3' step='0.1' value={layer.scale} onChange={e => { updateLayer(layer.id, { scale: e.target.value }); }} />
          </div>
          <label>{loc.flipX}</label>
          <input type='checkbox' defaultChecked={layer.flipX} onChange={e => { updateLayer(layer.id, { flipX: e.target.checked }); }} />
        </div>
      </div>
    </div>
  );
}

export default LayersPanel;