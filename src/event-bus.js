const Vue = require('vue').default;
// const memoize = require('lodash.memoize');

const bus = new Vue();

function fail(why) { throw new Error(why); }

Object.assign(bus, {

  // simpleEmitter: memoize(evName => () => bus.$emit(evName)),

  multiEmit(queue, ...unsupported) {
    if (!Array.isArray(queue)) { fail('Event queue must be an array.'); }
    if (unsupported.length) { fail('Too many arguments.'); }
    let nextIndex = 0;
    // console.debug('eventBus multiEmit:', queue);
    (function emitNext() {
      const ev = queue[nextIndex];
      // console.debug('eventBus multiEmit: emitNext:', nextIndex, ev);
      nextIndex += 1;
      if (ev) { bus.$emit(...[].concat(ev)); }
      if (nextIndex < queue.length) { setTimeout(emitNext, 100); }
    }());
  },

});

module.exports = bus;
