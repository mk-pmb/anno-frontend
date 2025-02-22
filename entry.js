'use strict';
(function namespace() {
  const main = require('./src/main.js');
  window[main.appName] = main;
}());
