const arrayOfTruths = require('array-of-truths');
const getOwn = require('getown');
const isStr = require('is-string');


const EX = function formatters(name, ...args) {
  const vueElem = this;
  // ^- Expected to be used as a method of a Vue element which provides
  //    vueElem.l10n.
  return EX[name](vueElem, ...args);
};


Object.assign(EX, {

  debug: 0, // Increase before the section where you want it, decrease after.

  list(itemFormatter, vueElem, items) {
    if (isStr(itemFormatter)) {
      const fmtFunc = getOwn(EX, itemFormatter);
      if (!fmtFunc) { throw new Error('No such formatter: ' + itemFormatter); }
      return EX.list(fmtFunc, vueElem, items);
    }
    if (!items) { return ''; }
    const t = arrayOfTruths.ifAnyMap(items, x => itemFormatter(vueElem, x));
    return (t ? t.join(', ') : '');
  },

  agentNickname(vueElem, agent) {
    if (EX.debug) { console.debug('fmt agentNickname:', agent); }
    if (!agent) { return vueElem.l10n('no_data'); }
    if (isStr(agent)) { return EX.agentNickname(vueElem, { id: agent }); }
    const name = (agent.nickname
      || agent.name
      || (vueElem.l10n('nameless_agent') + ' id=' + agent.id));
    return name;
  },


});


module.exports = EX;
