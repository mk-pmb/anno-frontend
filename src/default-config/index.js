/* -*- tab-width: 2 -*- */
'use strict';

/* eslint-disable global-require */

const staticDefaults = {
  ...require('./anno-data.js'),
  ...require('./debug.js'),
  ...require('./html-dom.js'),
  ...require('./servers.js'),
  ...require('./user-interface.js'),
};


function decide() {
  const cfg = {
    ...staticDefaults,
  };
  return cfg;
};



module.exports = decide;
