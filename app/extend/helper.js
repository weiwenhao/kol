'use strict';

module.exports = {
  parseInt(string) {
    if (typeof string === 'number') return string;
    if (!string) return string;
    return parseInt(string) || 0;
  },
  sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  },
};
