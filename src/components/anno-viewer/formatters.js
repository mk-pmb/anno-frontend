const isStr = require('is-string');

const EX = function formatters(name, ...args) {
  const vueElem = this;
  // ^- Expected to be used as a method of a Vue element which provides
  //    vueElem.l10n.
  return EX[name](vueElem, ...args);
};


Object.assign(EX, {

  agentNickname(vueElem, agent) {
    if (!agent) { return vueElem.l10n('no_data'); }
    if (isStr(agent)) { return EX.agentNickname(vueElem, { id: agent }); }
    const name = (agent.nickname
      || agent.name
      || (vueElem.l10n('nameless_agent') + ' id=' + agent.id));
    return name;
  },


});


module.exports = EX;
