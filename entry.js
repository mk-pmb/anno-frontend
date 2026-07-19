'use strict';
(function namespace() {
  const stub = require('./src/appStub.js');
  window[stub.appName] = stub;
  window[stub.appName] = require('./src/main.js');
}());
