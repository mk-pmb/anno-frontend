// const loMapValues = require('lodash.mapvalues');

function mthdIf(m, o) {
  const f = o && o[m];
  return (f ? f.call(o) : o);
}


const EX = function makeOneExtractor(onBehalfOfVueElem, name, how) {
  if (!how) { return EX(onBehalfOfVueElem, name, true); }
  let { field } = how;
  field ||= '';
  if ((!field) || field.endsWith(':')) { field += name; }
  let xf = EX.makeBasicGetter(field);
  xf = EX.addTransform(xf, how.transform);
  xf = EX.addTransform(xf, how.transformVue, onBehalfOfVueElem);
  xf = EX.addTransform(xf, mthdIf.bind(null, 'toLowerCase'));
  return xf;
};


Object.assign(EX, {

  makeBasicGetter: k => o => (o[k] || ''),

  addTransform(f, g, a) {
    if (!g) { return f; }
    if (a) { return x => (g(a, f(x))); }
    return (x => g(f(x)));
  },

  addDebugTee(f, ...msg) {
    return function debugTee(x) {
      console.debug('>>>', ...msg, { x }, '-> ?');
      const y = f(x);
      console.debug('<<<', ...msg, { x }, '->', (y === x ? '=' : { y }));
      return y;
    };
  },

  addDebugLog(f, ...msg) {
    return function debugLog(x) {
      const y = f(x);
      console.debug(...msg);
      return y;
    };
  },



});




module.exports = EX;
