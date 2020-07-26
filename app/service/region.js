'use strict';

const path = require('path');
const fs = require('fs');

const Service = require('egg').Service;

class regionService extends Service {
  constructor(ctx) {
    super(ctx);
    const dataPath = path.resolve(process.cwd() + '/database/region_data.json');
    const dataString = fs.readFileSync(dataPath);
    const region = JSON.parse(dataString);
    this.stateToCountry = this.parseStateMap(region);
  }

  parseStateMap(region) {
    const stateToCountry = {};
    region.forEach(country => {
      country.regions.forEach(state => {
        stateToCountry[state.name] = country.countryName;
      });
    });

    return stateToCountry;
  }

  findCountry(state) {
    return this.stateToCountry[state];
  }
}

module.exports = regionService;
