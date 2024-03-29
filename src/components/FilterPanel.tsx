import SliderGroup from "./SliderGroup";
import { FunctionComponent, useContext, useEffect, useState } from "react";
import { LanguageContext } from "../context/language-context";
import { Layer } from "../types/data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

const parameterInfo: Record<
  string,
  { unit: string; initial: string | number }
> = {
  length: {
    unit: "px",
    initial: 0,
  },
  percentage: {
    unit: "",
    initial: 0,
  },
  degree: {
    unit: "deg",
    initial: 0,
  },
  color: {
    unit: "",
    initial: "#ffffff",
  },
};

interface FilterArgument {
  arguments?: {
    name: string;
    type: string;
  }[];
}

const filterArguments: Record<string, FilterArgument> = {
  flashback: {},
  blur: {
    arguments: [{ name: "amount", type: "length" }],
  },
  brightness: {
    arguments: [{ name: "percentage", type: "percentage" }],
  },
  contrast: {
    arguments: [{ name: "percentage", type: "percentage" }],
  },
  "drop-shadow": {
    arguments: [
      { name: "offsetX", type: "length" },
      { name: "offsetY", type: "length" },
      { name: "blur", type: "length" },
      { name: "color", type: "color" },
    ],
  },
  grayscale: {
    arguments: [{ name: "percentage", type: "percentage" }],
  },
  "hue-rotate": {
    arguments: [{ name: "degree", type: "degree" }],
  },
  invert: {
    arguments: [{ name: "percentage", type: "percentage" }],
  },
  saturate: {
    arguments: [{ name: "percentage", type: "percentage" }],
  },
  sepia: {
    arguments: [{ name: "percentage", type: "percentage" }],
  },
};

interface FilterValue {
  name: string;
  type: string;
  value: string | number;
}

interface FilterPanelProps {
  layer: Layer;
  updateLayer: (updateLayerId: number | undefined, updated: any) => void;
}

const FilterPanel: FunctionComponent<FilterPanelProps> = ({
  layer,
  updateLayer,
}) => {
  const language = useContext(LanguageContext);
  const loc = language.loc.layers;

  const [filterType, setFilterType] = useState("");
  const [filterValue, setFilterValue] = useState<FilterValue[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [originalValue, setOriginalValue] = useState(layer.filter);

  useEffect(() => {
    newFilterValue(filterType);
  }, [filterType]);

  useEffect(() => {
    updateLayer(layer.id, { filter: `${originalValue} ${getFilter()}`.trim() });
  }, [filterValue]);

  /**
   * Returns the CSS value string of the current filter
   * @returns {string} - CSS filter string
   */
  function getFilter() {
    switch (filterType) {
      case "":
        return "";
      case "flashback":
        return "url(#flashback)";
      default:
        const joined = filterValue
          .map((v) => `${v.value}${parameterInfo[v.type].unit}`)
          .join(" ");
        return `${filterType}(${joined})`;
    }
  }

  /**
   * Set the default value for a new filter
   * @param filterType {string} - Type of filter to set
   */
  function newFilterValue(filterType: string): void {
    const filterArgument = filterArguments[filterType];
    if (!filterArgument || !filterArgument.arguments) {
      setFilterValue([]);
      return;
    }

    setFilterValue(
      filterArgument.arguments.map((item) => {
        return {
          name: loc.filter[item.name],
          type: item.type,
          value: parameterInfo[item.type].initial,
        };
      })
    );
  }

  function updateFilterValue(index: number, value: string) {
    setFilterValue((prev) =>
      prev.map((prevVal, i) => (i === index ? { ...prevVal, value } : prevVal))
    );
  }

  function clearFilter() {
    setFilterType("");
    setOriginalValue("");
    updateLayer(layer.id, { filter: "" });
  }

  function showPanel() {
    setOriginalValue(layer.filter);
    setPanelOpen(true);
  }

  function hidePanel() {
    setPanelOpen(false);
    setOriginalValue(`${originalValue} ${getFilter()}`.trim());
    setFilterType("");
  }

  return (
    <div className="filter-panel">
      <label>
        <FontAwesomeIcon icon={faFilter} /> {loc.filter.filter}
      </label>
      <div className="input-group--delete">
        <input
          type="text"
          value={
            filterType !== ""
              ? `${originalValue} ${getFilter()}`.trim()
              : layer.filter
          }
          disabled={filterType !== ""}
          onChange={(e) => {
            setOriginalValue(e.target.value);
            updateLayer(layer.id, { filter: e.target.value });
          }}
          onFocus={showPanel}
          onBlur={(e) => {
            if (!e.relatedTarget) hidePanel();
          }}
        />
        <button className="button delete" onClick={clearFilter}>
          ×
        </button>
      </div>

      {panelOpen && (
        <div>
          <label>{loc.filter.type}</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">{loc.filter.none}</option>
            <option value="flashback">{loc.filter.flashback}</option>
            <option value="blur">{loc.filter.blur}</option>
            <option value="brightness">{loc.filter.brightness}</option>
            <option value="contrast">{loc.filter.contrast}</option>
            <option value="drop-shadow">{loc.filter.dropShadow}</option>
            <option value="grayscale">{loc.filter.grayscale}</option>
            <option value="hue-rotate">{loc.filter.hueRotate}</option>
            <option value="invert">{loc.filter.invert}</option>
            <option value="saturate">{loc.filter.saturate}</option>
            <option value="sepia">{loc.filter.sepia}</option>
          </select>

          {filterValue.map((item, index) => {
            switch (item.type) {
              case "length":
                return (
                  <SliderGroup
                    key={`length-${index}`}
                    label={item.name}
                    min={0}
                    max={200}
                    step={1}
                    value={item.value}
                    onChange={(e) => updateFilterValue(index, e.target.value)}
                  />
                );
              case "percentage":
                return (
                  <SliderGroup
                    key={`percentage-${index}`}
                    label={item.name}
                    min={0}
                    max={2}
                    step={0.01}
                    value={item.value}
                    onChange={(e) => updateFilterValue(index, e.target.value)}
                  />
                );
              case "degree":
                return (
                  <SliderGroup
                    key={`degree-${index}`}
                    label={item.name}
                    min={0}
                    max={360}
                    step={1}
                    value={item.value}
                    onChange={(e) => updateFilterValue(index, e.target.value)}
                  />
                );
              case "color":
                return (
                  <div key={`color-${index}`}>
                    <label>{item.name}</label>
                    <input
                      type="color"
                      value={item.value}
                      onChange={(e) => updateFilterValue(index, e.target.value)}
                    />
                  </div>
                );
              default:
                return undefined;
            }
          })}
          <button className="button" onClick={hidePanel}>
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
