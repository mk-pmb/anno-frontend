const autoDefault = require('require-mjs-autoprefer-default-export-pmb');
const Vue = autoDefault(require('vue'));
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

    function decideDelay(ev, ...args) {
      if (!ev) { return 1; }
      const [arg1] = args;
      if (ev === 'wait') { return (+arg1 || 1) * 1e3; }
      bus.$emit(ev, ...args);
      return 100;
    }

    (function emitNext() {
      const ev = queue[nextIndex];
      // console.debug('eventBus multiEmit: emitNext:', nextIndex, ev);
      nextIndex += 1;
      const delay = decideDelay(...[].concat(ev));
      if (nextIndex < queue.length) { setTimeout(emitNext, delay); }
    }());
  },

});


(function installRemindersForMistakenEventNames() {
  const commonMistakes = {
    edit: 'revise?',
    editByUrl: 'reviseByUrl?',
  };
  const msg = 'W: anno-frontend: Probably futile eventBus call:';
  function reminder(evName, hint, ...args) {
    console.warn(msg, { evName, hint}, args);
  }
  Object.entries(commonMistakes).forEach(([evName, hint]) => bus.$on(
    evName, reminder.bind(null, evName, hint)));
}());


module.exports = bus;
