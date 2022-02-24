import "./LayersPanel.scss";
import PortraitPanel from "./PortraitPanel";
import BackgroundPanel from "./BackgroundPanel";
import LayerDeletePrompt from "./LayerDeletePrompt";
import SliderGroup from "./SliderGroup";
import FilterPanel from "./FilterPanel";

import usePrevious from "../hooks/usePrevious";

import { FunctionComponent, useContext, useEffect, useState } from "react";

import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToWindowEdges, snapCenterToCursor } from "@dnd-kit/modifiers";

import { LanguageContext } from "../context/language-context";
import { Layer } from "../types/data";
import { LayerOperations } from "./App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightArrowLeft,
  faArrowsLeftRight,
  faArrowsUpDown,
  faEye,
  faImage,
  faLayerGroup,
  faMaximize,
  faPen,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";

const isWebkit = navigator.userAgent.indexOf("AppleWebKit") !== -1;

interface LayersPanelProps {
  layers: Layer[];
  layerOperations: LayerOperations;
}

export interface LayerModifyProps {
  activeLayer: number;
  updateLayer: (updateLayerId: number | undefined, updated: any) => void;
}

export const LayersPanel: FunctionComponent<LayersPanelProps> = ({
  layers,
  layerOperations,
}) => {
  const [activeTabId, setActiveTab] = useState(0);
  const [portraitPanelActive, setPortraitPanelActive] = useState(false);
  const [backgroundPanelActive, setBackgroundPanelActive] = useState(false);
  const [deletePanelActive, setDeletePanelActive] = useState(false);

  const { addLayerDefault, removeLayer, updateLayer, reorderLayer } =
    layerOperations;
  const prevLayers = usePrevious(layers);

  useEffect(() => {
    if (
      layers &&
      layers.length &&
      (!prevLayers || (prevLayers && prevLayers.length !== layers.length))
    ) {
      const activeTabId = layers[layers.length - 1].id;
      if (activeTabId !== undefined) {
        setActiveTab(activeTabId);
      }
    }
  }, [layers, prevLayers]);

  const togglePortraitPanel = () => {
    setPortraitPanelActive(!portraitPanelActive);
    setBackgroundPanelActive(false);
  };

  const toggleBackgroundPanel = () => {
    setBackgroundPanelActive(!backgroundPanelActive);
    setPortraitPanelActive(false);
  };

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      distance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const items: string[] = [];

  const panelButtons = (
    <PanelButtons
      togglePortrait={togglePortraitPanel}
      toggleBackground={toggleBackgroundPanel}
      openPrompt={() => setDeletePanelActive(true)}
      portraitActive={portraitPanelActive}
      backgroundActive={backgroundPanelActive}
    />
  );

  const tabContents = layers.map((lyr) => {
    items.push(`tab_${lyr.id}`);
    return (
      <LayerTabPane
        key={lyr.id}
        layer={lyr}
        active={lyr.id === activeTabId}
        panelButtons={panelButtons}
        updateLayer={updateLayer}
      />
    );
  });

  const tabs = tabContents.map((tabContent, index) => (
    <LayerTab
      key={`tab_${tabContent.props.layer.id}`}
      layer={tabContent.props.layer}
      onClick={setActiveTab}
      activeTab={tabContent.props.layer.id === activeTabId}
      index={index}
    />
  ));

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={reorderLayer}
      collisionDetection={closestCenter}
      modifiers={[snapCenterToCursor, restrictToWindowEdges]}
    >
      <div>
        <ul className="tab-bar">
          <SortableContext items={items} strategy={rectSortingStrategy}>
            {tabs}
          </SortableContext>
          <li onClick={addLayerDefault} id="addLayer">
            +
          </li>
        </ul>
        <div>{tabContents}</div>
        {portraitPanelActive && (
          <PortraitPanel activeLayer={activeTabId} updateLayer={updateLayer} />
        )}
        {backgroundPanelActive && (
          <BackgroundPanel
            activeLayer={activeTabId}
            updateLayer={updateLayer}
          />
        )}
      </div>
      <LayerDeletePrompt
        active={deletePanelActive}
        removeLayer={() => removeLayer(activeTabId)}
        closePrompt={() => setDeletePanelActive(false)}
      />
    </DndContext>
  );
};

interface LayerTabProps {
  index: number;
  activeTab: boolean;
  layer: Layer;
  onClick: (layerId: number) => void;
}

const LayerTab: FunctionComponent<LayerTabProps> = ({
  index,
  activeTab,
  layer,
  onClick,
}) => {
  const { active, attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: `tab_${layer.id}`,
      data: {
        index: index,
      },
    });

  const isActive = active !== null && active.id === `tab_${layer.id}`;

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      onClick={() => {
        onClick(layer.id ? layer.id : 0);
      }}
      {...listeners}
      {...attributes}
      id={`tab_${layer.id}`}
      className={`${activeTab ? "active" : ""} ${isActive ? "dragging" : ""}`}
    >
      {layer.name ? layer.name.substring(0, 10) : ""}
    </li>
  );
};

interface LayerTabPaneProps {
  layer: Layer;
  updateLayer: (updateLayerId: number | undefined, updated: any) => void;
  active: boolean;
  panelButtons: JSX.Element;
}

const LayerTabPane: FunctionComponent<LayerTabPaneProps> = ({
  layer,
  updateLayer,
  active,
  panelButtons,
}) => {
  const language = useContext(LanguageContext);
  const loc = language.loc.layers;
  return (
    <div className={`tab ${active ? "active" : ""}`}>
      <div>
        <h2>
          <FontAwesomeIcon icon={faImage} /> {loc.layerImage}
        </h2>
        <label>{loc.reccomendedSize}</label>
        <div className="layer-panel__img-container">
          <img
            src={layer.src}
            alt="Layer"
            id={`img_${layer.id}`}
            onLoad={(e) => {
              updateLayer(layer.id, { image: e.currentTarget });
            }}
            crossOrigin="anonymous"
          />
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const input: HTMLInputElement = e.currentTarget;
            if (!input || !input.files) return;
            updateLayer(layer.id, {
              src: window.URL.createObjectURL(input.files[0]),
            });
          }}
        />
        {panelButtons}
      </div>
      <div>
        <div>
          <label>
            <FontAwesomeIcon icon={faPen} /> {loc.layerName}
          </label>
          <input
            type="text"
            placeholder={loc.layerName}
            defaultValue={layer.name}
            onChange={(e) => {
              updateLayer(layer.id, { name: e.target.value });
            }}
          />
        </div>
        <SliderGroup
          label={
            <>
              <FontAwesomeIcon icon={faEye} /> {loc.opacity}
            </>
          }
          min={0}
          max={1}
          step={0.01}
          value={layer.opacity !== undefined ? layer.opacity : 1}
          onChange={(e) =>
            updateLayer(layer.id, { opacity: parseFloat(e.target.value) })
          }
        />
        <SliderGroup
          label={
            <>
              <FontAwesomeIcon icon={faArrowsLeftRight} /> {loc.offsetX}
            </>
          }
          min={-400}
          max={400}
          step={1}
          value={layer.offsetX}
          onChange={(e) =>
            updateLayer(layer.id, { offsetX: parseFloat(e.target.value) })
          }
        />
        <SliderGroup
          label={
            <>
              <FontAwesomeIcon icon={faArrowsUpDown} /> {loc.offsetY}
            </>
          }
          min={-400}
          max={400}
          step={1}
          value={layer.offsetY}
          onChange={(e) =>
            updateLayer(layer.id, { offsetY: parseFloat(e.target.value) })
          }
        />
        <SliderGroup
          label={
            <>
              <FontAwesomeIcon icon={faRotate} /> {loc.rotation}
            </>
          }
          min={-180}
          max={180}
          step={0.1}
          value={layer.rotation !== undefined ? layer.rotation : 0}
          onChange={(e) =>
            updateLayer(layer.id, { rotation: parseFloat(e.target.value) })
          }
        />
        <SliderGroup
          label={
            <>
              <FontAwesomeIcon icon={faMaximize} /> {loc.scale}
            </>
          }
          min={0}
          max={3}
          step={0.1}
          value={layer.scale !== undefined ? layer.scale : 1}
          onChange={(e) =>
            updateLayer(layer.id, { scale: parseFloat(e.target.value) })
          }
        />
        <label>
          <FontAwesomeIcon icon={faArrowRightArrowLeft} /> {loc.flipX}
        </label>
        <input
          type="checkbox"
          defaultChecked={layer.flipX}
          onChange={(e) => updateLayer(layer.id, { flipX: e.target.checked })}
        />
        {!isWebkit && <FilterPanel layer={layer} updateLayer={updateLayer} />}
      </div>
    </div>
  );
};

interface PanelButtonsProps {
  portraitActive: boolean;
  backgroundActive: boolean;
  togglePortrait: React.MouseEventHandler<HTMLButtonElement>;
  toggleBackground: React.MouseEventHandler<HTMLButtonElement>;
  openPrompt: React.MouseEventHandler<HTMLButtonElement>;
}

const PanelButtons: FunctionComponent<PanelButtonsProps> = ({
  portraitActive,
  backgroundActive,
  togglePortrait,
  toggleBackground,
  openPrompt,
}) => {
  const language = useContext(LanguageContext);
  const loc = language.loc.layers;
  return (
    <>
      <button className="button delete" onClick={openPrompt}>
        {loc.deleteLayer}
      </button>
      <button
        className={`button ${portraitActive ? "selected" : ""}`}
        onClick={togglePortrait}
      >
        {loc.portrait}
      </button>
      <button
        className={`button ${backgroundActive ? "selected" : ""}`}
        onClick={toggleBackground}
      >
        {loc.background}
      </button>
    </>
  );
};
