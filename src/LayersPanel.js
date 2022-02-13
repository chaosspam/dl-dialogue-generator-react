import './LayersPanel.css';
import PortraitPanel from './PortraitPanel.js';
import BackgroundPanel from './BackgroundPanel.js';
import LayerDeletePrompt from './LayerDeletePrompt.js';
import SliderGroup from './SliderGroup';
import usePrevious from './usePrevious';
import { useEffect, useState } from 'react';
import { DndContext, useSensor, useSensors, MouseSensor, TouchSensor, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { restrictToWindowEdges, snapCenterToCursor } from '@dnd-kit/modifiers';
import i18n from './data/i18n.json';

export default function LayersPanel({ layers, drawDialogueScreen, addLayer, removeLayer, updateLayer, reorderLayer, pageLang, isWebkit }) {
  const [activeTabId, setActiveTab] = useState(0);
  const [portraitPanelActive, setPortraitPanelActive] = useState(false);
  const [backgroundPanelActive, setBackgroundPanelActive] = useState(false);
  const [deletePanelActive, setDeletePanelActive] = useState(false);
  const loc = i18n[pageLang].loc.layers;

  const prevLayers = usePrevious(layers);

  useEffect(() => {
    if (layers && layers.length &&
      ((!prevLayers) || (prevLayers && prevLayers.length !== layers.length))) {
      setActiveTab(layers[layers.length - 1].id);
    }
  }, [layers, prevLayers]);

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

  const tabContents = layers.map(lyr => {
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
      isWebkit={isWebkit}
    />;
  });

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
    active, isWebkit
  } = props;
  return (
    <div className={`tab ${active ? 'active' : ''}`}>
      <div>
        <h2>{loc.layerImage}</h2>
        <label>{loc.reccomendedSize}</label>
        <img src={layer.image} alt='Layer' id={`img_${layer.id}`} onLoad={drawDialogueScreen} crossOrigin="anonymous" />
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
        <SliderGroup
          label={loc.opacity} min='0' max='1' step='0.01'
          value={layer.opacity}
          onChange={e => updateLayer(layer.id, { opacity: e.target.value })}
        />
        <SliderGroup
          label={loc.offsetX} min='-400' max='400' step='1'
          value={layer.offsetX}
          onChange={e => updateLayer(layer.id, { offsetX: e.target.value })}
        />
        <SliderGroup
          label={loc.offsetY} min='-400' max='400' step='1'
          value={layer.offsetY}
          onChange={e => updateLayer(layer.id, { offsetY: e.target.value })}
        />
        <SliderGroup
          label={loc.rotation} min='-180' max='180' step='0.1'
          value={layer.rotation}
          onChange={e => updateLayer(layer.id, { rotation: e.target.value })}
        />
        <SliderGroup
          label={loc.scale} min='0' max='3' step='0.1'
          value={layer.scale}
          onChange={e => updateLayer(layer.id, { scale: e.target.value })}
        />
        <label>{loc.flipX}</label>
        <input
          type='checkbox'
          defaultChecked={layer.flipX}
          onChange={e => updateLayer(layer.id, { flipX: e.target.checked })}
        />
        {!isWebkit && <FilterPanel loc={loc} layer={layer} updateLayer={updateLayer}/>}
      </div>
    </div>
  );
}

const filterArguments = {
  'flashback': {
  },
  'blur': {
    arguments: [{name: 'amount', type: 'length'}]
  },
  'brightness': {
    arguments: [{name: 'percentage', type: 'percentage'}]
  },
  'contrast':{
    arguments: [{name: 'percentage', type: 'percentage'}]
  },
  'drop-shadow':{
    arguments: [{name: 'offsetX', type: 'length'}, {name: 'offsetY', type: 'length'}, {name: 'blur', type: 'length'}, {name: 'color', type: 'color'}]
  },
  'grayscale':{
    arguments: [{name: 'percentage', type: 'percentage'}]
  },
  'hue-rotate':{
    arguments: [{name: 'degree', type: 'degree'}]
  },
  'invert':{
    arguments: [{name: 'percentage', type: 'percentage'}]
  },
  'saturate':{
    arguments: [{name: 'percentage', type: 'percentage'}]
  },
  'sepia':{
    arguments: [{name: 'percentage', type: 'percentage'}]
  }
}

const parameterInfo = {
  length: {
    unit: 'px',
    initial: 0
  },
  percentage: {
    unit: '',
    initial: 0
  },
  degree: {
    unit: 'deg',
    initial: 0
  },
  color: {
    unit: '',
    initial: '#ffffff'
  },
}
function FilterPanel({ loc, layer, updateLayer }) {

  const [ filterType, setFilterType ] = useState('');
  const [ filterValue, setFilterValue ] = useState([]);
  const [ panelOpen, setPanelOpen ] = useState(false);
  const [ originalValue, setOriginalValue ] = useState(layer.filter);

  useEffect(() => {
    newFilterValue(filterType);
  }, [filterType]);

  useEffect(() => {
    updateLayer(layer.id, { filter: `${originalValue} ${getFilter()}`.trim() });
  }, [filterValue])

  function getFilter() {
    switch (filterType) {
      case '':
        return '';
      case 'flashback':
        return 'url(#flashback)';
      default:
        const joined = filterValue
          .map(v => `${v.value}${parameterInfo[v.type].unit}`)
          .join(' ');
        return `${filterType}(${joined})`;
    }
  }

  function newFilterValue(filterType) {
    if(!filterArguments[filterType]) {
      setFilterValue([]);
      return;
    }
    if(!filterArguments[filterType].arguments) {
      setFilterValue([]);
      return;
    }

    setFilterValue(filterArguments[filterType].arguments.map(
        item => {
          return { name: loc.filter[item.name], type: item.type, value: parameterInfo[item.type].initial};
        }
    ));
  }

  function updateFilterValue(index, value) {
    setFilterValue(prev => prev.map((prevVal, i) => i === index ? {...prevVal, value} : prevVal));
  }

  function clearFilter() {
    setFilterType('');
    setOriginalValue('');
    updateLayer(layer.id, { filter: '' });
  }

  function showPanel() {
    setOriginalValue(layer.filter);
    setPanelOpen(true);
  }

  function hidePanel() {
    setPanelOpen(false);
    setOriginalValue(`${originalValue} ${getFilter()}`.trim());
    setFilterType('');
  }

  return (
    <div className='filter-panel'>
      <label>{loc.filter.filter}</label>
      <div className='input-group--delete'>
        <input
          type='text'
          value={filterType !== '' ? `${originalValue} ${getFilter()}`.trim() : layer.filter}
          disabled={filterType !== ''}
          onChange={e => {
            setOriginalValue(e.target.value);
            updateLayer(layer.id, { filter: e.target.value });
          }}
          onFocus={showPanel}
          onBlur={(e) => {if (!e.relatedTarget) hidePanel()}}
        />
        <button className='button delete' onClick={clearFilter}>×</button>
      </div>

      { panelOpen &&
        <div>
          <label>{loc.filter.type}</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} >
            <option value=''>{loc.filter.none}</option>
            <option value='flashback'>{loc.filter.flashback}</option>
            <option value='blur'>{loc.filter.blur}</option>
            <option value='brightness'>{loc.filter.brightness}</option>
            <option value='contrast'>{loc.filter.contrast}</option>
            <option value='drop-shadow'>{loc.filter.dropShadow}</option>
            <option value='grayscale'>{loc.filter.grayscale}</option>
            <option value='hue-rotate'>{loc.filter.hueRotate}</option>
            <option value='invert'>{loc.filter.invert}</option>
            <option value='saturate'>{loc.filter.saturate}</option>
            <option value='sepia'>{loc.filter.sepia}</option>
          </select>

          {
            filterValue.map((item, index) => {
              switch(item.type) {
                case 'length':
                  return (<SliderGroup
                    key={`length-${index}`}
                    label={item.name} min='0' max='200' step='1'
                    value={item.value}
                    onChange={e => updateFilterValue(index, e.target.value)}
                  />);
                case 'percentage':
                  return (<SliderGroup
                    key={`percentage-${index}`}
                    label={item.name} min='0' max='2' step='0.01'
                    value={item.value}
                    onChange={e => updateFilterValue(index, e.target.value)}
                  />);
                case 'degree':
                  return (<SliderGroup
                    key={`degree-${index}`}
                    label={item.name} min='0' max='360' step='1'
                    value={item.value}
                    onChange={e => updateFilterValue(index, e.target.value)}
                  />);
                case 'color':
                  return (<div
                    key={`color-${index}`}>
                    <label>{item.name}</label>
                    <input type="color" value={item.value} onChange={e => updateFilterValue(index, e.target.value)}/>
                  </div>);
                default:
                  return undefined;
              }
            })
          }
          <button className='button' onClick={hidePanel}>Save</button>
        </div>
      }
    </div>
  );
}