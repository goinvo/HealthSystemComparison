import React, { Component, createRef } from 'react'
import { extent } from 'd3-array'
import { geoMercator, geoPath } from 'd3-geo'
import { scaleLinear, scaleOrdinal } from 'd3-scale'
import { schemeCategory10 } from 'd3-scale-chromatic'
import { feature } from 'topojson-client'

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
      height: width * this.heightFactor,
      hale: false
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

  setHale = (e) => {
    this.setState({ hale: e.target.checked });
  }

  render() {
    const { width, height } = this.state;

    const categories = [...new Set(this.props.data.map(d => d.type))].filter(d => d !== null);
    const data = feature(countries, { type: "GeometryCollection", geometries: countries.objects.countries.geometries.filter(d => d.id !== antarcticaId) });
    const features = data.features.filter(d => d.id !== antarcticaId);
    const projection = geoMercator()
      .fitSize([width, height], data);
    const mappedData = new Map(this.props.data.map(country => {
        return [country.name, { type: country.type, hale: country.hale }];
      }));
    const color = scaleOrdinal()
      .domain(categories)
      .range(schemeCategory10);

    const haleData = this.props.data.map(d => d.hale);
    const hale = scaleLinear()
      .domain(extent(haleData))
      .range([0, 1]);

    return (
      <div className="world-map" ref={this.container}>
        <svg width={ width } height={ height }>
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
          { categories.map((d, i) => {
            return <li key={d}><div className="legend__block" style={{ backgroundColor: color(d) }}></div> {d}</li>
          })}
        </ul>
        <input type="checkbox" checked={this.state.hale} onChange={this.setHale} />
      </div>
    )
  }
}

export default WorldMap;
