const EX = function makeOneComparator(key, neg) {
  let cmp = EX.nativeComparator;
  if (neg) { cmp = EX.negateComparator(cmp); }
  cmp = EX.makeTwinPropsProxy(cmp, key);
  // cmp.key = (neg ? '¬' : '') + key;
  return cmp;
};


Object.assign(EX, {

  nativeComparator(a, b) { return ((a < b) && -1) || ((a > b) && 1) || 0; },
  negateComparator(f) { return (a, b) => (1 - f(a, b)); },
  makeTwinPropsProxy(f, k) { return (a, b) => f(a[k], b[k]); },

});


module.exports = EX;
