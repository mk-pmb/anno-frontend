// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const EX = function identifyImportedFromNamespace(appCfg, anno) {
  // e.g. xrq/importAnnosFromCeson
  const impFrom = String(anno['ubhd:sourceUrl'] || '');
  if (!impFrom) { return 'anno'; }
  const fromEndpoint = EX.endpointPriorities.find(function chk(name) {
    const url = appCfg[name + 'Endpoint'];
    if (!url) { return; }
    if (!impFrom.startsWith(url)) { return; }
    return name;
  });
  if (fromEndpoint) { return fromEndpoint; }
  return 'web';
};


Object.assign(EX, {

  endpointPriorities: [
    'draftStore',
    'anno',
  ],

});






module.exports = EX;
