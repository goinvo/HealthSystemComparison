import React, { Component } from 'react'
import { geoMercator, geoPath } from 'd3-geo'
import { scaleOrdinal } from 'd3-scale'
import { schemeCategory10 } from 'd3-scale-chromatic'
import { feature } from 'topojson-client'

import countries from 'world-atlas/countries-10m.json'
import countryTypes from './data.json'

const systemTypes = ["Universal", "Universal-Income", "Private-Public", "Private-Subsidized", "Private-Partially-Subsidized"]
const antarcticaId = "010"

class WorldMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 1200,
      height: 900
    }
  }

  render() {
    const data = feature(countries, { type: "GeometryCollection", geometries: countries.objects.countries.geometries.filter(d => d.id !== antarcticaId) });
    const features = data.features.filter(d => d.id !== antarcticaId);
    const projection = geoMercator()
      .fitSize([this.state.width, this.state.height], data);
    const mappedData = new Map(countryTypes.map(country => {
        return [country.name, { type: country.type }];
      }));
    const color = scaleOrdinal()
      .domain(["Universal", "Universal-Income", "Private-Public", "Private-Subsidized", "Private-Partially-Subsidized"])
      .range(schemeCategory10);

    return (
      <div>
        <svg width={ this.state.width } height={ this.state.height }>
          <g className="countries">
            {
              features.map((d, i) => {
                const obj = mappedData.get(d.properties.name);
                return (
                  <path
                    key={ `path-${ i }` }
                    d={ geoPath().projection(projection)(d) }
                    className={`country ${d.type}`}
                    fill={ (obj && color(obj.type)) }
                    stroke="#FFFFFF"
                    strokeWidth={ 0.5 }
                  />
                )
              })
            }
          </g>
          {/* <g className="markers">
            <circle
              cx={ this.projection()([8,48])[0] }
              cy={ this.projection()([8,48])[1] }
              r={ 10 }
              fill="#E91E63"
              className="marker"
            />
          </g> */}
        </svg>
        <ul className="legend">
          { systemTypes.map((d, i) => {
            return <li>{d}: <div className="legend__block" style={{ backgroundColor: color(d) }}></div></li>
          })}
        </ul>
      </div>
    )
  }
}

export default WorldMap;
