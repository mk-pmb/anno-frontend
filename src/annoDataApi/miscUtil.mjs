const mu = {

  memoObj: x => () => x,
  getterify: f => (...a) => mu.memoObj(f(...a)),

  url2basename(url) {
    return String(url || '').split(/#|\?/)[0].split('/').slice(-1)[0];
  },

  byStrPropDict(list, prop, refineKey) {
    const d = Object.create(null);
    list.forEach(function add(x) {
      if (!x) { return; }
      const v = x[prop];
      const w = String((refineKey ? refineKey(v) : v) || '');
      if (w) { d[w] = x; }
    });
    return d;
  },

};


export default mu;
