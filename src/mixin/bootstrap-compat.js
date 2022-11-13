/* -*- tab-width: 2 -*- */
'use strict';

const bsCompat = require('../bootstrap-compat.js');

const injectIntoData = { bootstrapOpts: bsCompat.sharedConfig };

module.exports = {
  data() { return injectIntoData; },
};
