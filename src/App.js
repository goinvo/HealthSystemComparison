import React, { Component } from 'react';
import ScrollSpy from 'react-scrollspy';
import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';

import './App.scss';

import WorldMap from './world-map';

import countryData from './data.json'

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentSection: 'intro',
      data: countryData.map(d => Object.assign(d, { opacity: 1 }))
    }

    const haleData = countryData.map(d => d.hale);
    this.haleScale = scaleLinear()
      .domain(extent(haleData))
      .range([0, 1]);
  }

  getOpacity = (d, currentSection) => {
    switch (currentSection) {
      case 'hale':
        return this.haleScale(d.hale);
      default:
        return 1;
    }
  }

  onScrollSpyUpdate = (current) => {
    this.setState({
      currentSection: current.id,
      data: this.state.data.map(d => Object.assign(d, { opacity: this.getOpacity(d, current.id) }))
    });
  }

  render() {
    return (
      <div className="App">
        <ScrollSpy items={ ['intro', 'type', 'coverage', 'hale'] } onUpdate={this.onScrollSpyUpdate} />
        <div className="header">
          <h1>Healthcare Systems Compared</h1>
        </div>
        <div className="map-container">
          <WorldMap data={this.state.data} />
        </div>
        <div className="content-container">
          <div className="section" id="intro">
            <h2>Introduction</h2>
            <p>
              Let's compare the world's different healthcare systems across countries.
              We'll look at each type of system, and score it on a number of criteria.
              Scroll down to apply criteria and see how the map changes to reflect each country's score.
            </p>
            <div className="section__bottom">Scroll Down!</div>
          </div>
          <div className="section" id="type">
            <h2>System types</h2>
            <p>
              Bleh bleh bleh
            </p>
          </div>
          <div className="section" id="coverage">
            <h2>Coverage</h2>
            <p>
              Bleh bleh bleh
            </p>
          </div>
          <div className="section" id="hale">
            <h2>Hale</h2>
            <p>
              Bleh bleh bleh
            </p>
          </div>
        </div>
      </div>
    )
  }
}

export default App;
