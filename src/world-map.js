import React, { Component, createRef } from 'react'
import { geoMercator, geoPath } from 'd3-geo'
import { scaleOrdinal } from 'd3-scale'
import { schemeCategory10 } from 'd3-scale-chromatic'
import { feature } from 'topojson-client'
import { NodeGroup } from 'react-move';

import countries from 'world-atlas/countries-110m.json'
const antarcticaId = "010"

// TODO: Stopped data at Kiribati

class WorldMap extends Component {
  constructor(props) {
    super(props);

    const width = 800;
    this.heightFactor = .55;

    this.state = {
      width,
      height: width * this.heightFactor
    }

    this.container = createRef();
  }

  componentDidMount() {
    const width = this.container.current.offsetWidth;

    this.setState({
      width,
      height: width * this.heightFactor
    })
  }

  render() {
    const { width, height } = this.state;

    const categories = [...new Set(this.props.data.map(d => d.type))].filter(d => d !== null);
    const data = feature(countries, { type: "GeometryCollection", geometries: countries.objects.countries.geometries.filter(d => d.id !== antarcticaId) });
    const features = data.features.filter(d => d.id !== antarcticaId);
    const projection = geoMercator()
      .fitSize([width, height], data);
    const mappedData = new Map(features.map(country => {
        return [country.properties.name, { ...country }];
      }));

    const color = scaleOrdinal()
      .domain(categories)
      .range(schemeCategory10);

    return (
      <div className="world-map" ref={this.container}>
        <svg width={ width } height={ height }>
          <g className="countries">
            <NodeGroup
              data={ this.props.data }
              keyAccessor={ d => d.name }
              start={(d, i) => ({
                opacity: 0
              })}
              enter={(d, i) => {
                return {
                  opacity: d.opacity
                }
              }}
              update={(d, i) => {
                return {
                  opacity: [d.opacity],
                  timing: { duration: 750 }
                }
              }}
              leave={(d, i) => ({
                opacity: [0],
                timing: { duration: 750 }
              })}
            >
              {(nodes) => (
                <g>
                  {nodes.map(({ key, data, state: { opacity } }) => {
                    const obj = mappedData.get(data.name);
                    return (
                      <path
                        key={key}
                        d={ geoPath().projection(projection)(obj) }
                        className={`country ${data.name}`}
                        fill={ data.type ? color(data.type) : '#f0f0f0' }
                        opacity={opacity}
                        stroke="#FFFFFF"
                        strokeWidth={ 0.5 }
                      />
                    )
                  })}
                </g>
              )}
            </NodeGroup>
          </g>
        </svg>
        <ul className="legend">
          { categories.map((d, i) => {
            return <li key={d}><div className="legend__block" style={{ backgroundColor: color(d) }}></div> {d}</li>
          })}
        </ul>
      </div>
    )
  }
}

export default WorldMap;
