const Vue = require('vue').default;
// const memoize = require('lodash.memoize');

const bus = new Vue();

Object.assign(bus, {

  // simpleEmitter: memoize(evName => () => bus.$emit(evName)),

});

module.exports = bus;
