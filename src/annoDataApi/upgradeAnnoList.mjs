import mu from './miscUtil.mjs';


function getterify(f) {
  return function g(...a) { return Object.bind(null, f(...a)); };
}


const upgr = function upgradeAnnoList(annos) {
  const byStrPropDict = mu.byStrPropDict.bind(null, annos);
  byStrPropDict.getter = getterify(byStrPropDict);
  const upgrades = {
    ...upgr.defaultListApi,
    byStrPropDict: {
      custom: byStrPropDict,
      fullIdUrl: byStrPropDict.getter('id'),
      idBasename: byStrPropDict.getter('id', a => mu.url2basename(a.id)),
      versionOfBn: byStrPropDict.getter('dc:isVersionOf', mu.url2basename),
    },
  };
  return upgrades;
};


upgr.inplace = annos => Object.assign(annos, upgr(annos));

upgr.defaultListApi = {

  findAnno(urlOrBasename) {
    const by = this.byStrPropDict;
    return (by.fullIdUrl()[urlOrBasename]
      || by.idBasename()[urlOrBasename]
      || by.versionOfBn()[urlOrBasename]
      || false);
  },

};


export default upgr;
