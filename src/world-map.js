import React, { Component } from 'react'
import { extent } from 'd3-array'
import { geoMercator, geoPath } from 'd3-geo'
import { scaleLinear, scaleOrdinal } from 'd3-scale'
import { schemeCategory10 } from 'd3-scale-chromatic'
import { feature } from 'topojson-client'

import countries from 'world-atlas/countries-110m.json'
import countryData from './data.json'

const systemTypes = ["Universal", "Universal-Income", "Private-Public", "Private-Subsidized", "Private-Partially-Subsidized"]
const antarcticaId = "010"

// TODO: Stopped data at Kiribati

class WorldMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 1200,
      height: 900,
      hale: false
    }
  }

  setHale = (e) => {
    this.setState({ hale: e.target.checked });
  }

  render() {
    const data = feature(countries, { type: "GeometryCollection", geometries: countries.objects.countries.geometries.filter(d => d.id !== antarcticaId) });
    const features = data.features.filter(d => d.id !== antarcticaId);
    const projection = geoMercator()
      .fitSize([this.state.width, this.state.height], data);
    const mappedData = new Map(countryData.map(country => {
        return [country.name, { type: country.type, hale: country.hale }];
      }));
    const color = scaleOrdinal()
      .domain(["Universal", "Universal-Income", "Private-Public", "Private-Subsidized", "Private-Partially-Subsidized"])
      .range(schemeCategory10);

    const haleData = countryData.map(d => d.hale);
    const hale = scaleLinear()
      .domain(extent(haleData))
      .range([0, 1]);

    return (
      <div>
        <svg width={ this.state.width } height={ this.state.height }>
          <g className="countries">
            {
              features.map((d, i) => {
                const obj = mappedData.get(d.properties.name);
                const opacity = this.state.hale ? ((obj && hale(obj.hale)) || 0) : 1;
                return (
                  <path
                    key={ `path-${ i }` }
                    d={ geoPath().projection(projection)(d) }
                    className={`country ${d.type}`}
                    fill={ obj ? color(obj.type) : '#f0f0f0' }
                    style={{ opacity: opacity }}
                    stroke="#FFFFFF"
                    strokeWidth={ 0.5 }
                  />
                )
              })
            }
          </g>
        </svg>
        <ul className="legend">
          { systemTypes.map((d, i) => {
            return <li key={d}>{d}: <div className="legend__block" style={{ backgroundColor: color(d) }}></div></li>
          })}
        </ul>
        <input type="checkbox" checked={this.state.hale} onChange={this.setHale} />
      </div>
    )
  }
}

export default WorldMap;
