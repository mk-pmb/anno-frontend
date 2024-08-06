const getOwn = require('getown');

const EX = {

  find(appCfg, st) {
    let d = appCfg.stampActionPathPrefixesByStampName;
    d = getOwn(d, st.type);
    if ((d && typeof d) === 'object') { d = d[st.action]; }
    return d || '';
  },

};


module.exports = EX;
