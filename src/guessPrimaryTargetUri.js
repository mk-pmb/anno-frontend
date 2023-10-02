// -*- coding: utf-8, tab-width: 2 -*-

const findTargetUri = require('./findTargetUri.js');


const EX = function guessPrimaryTargetUri(anno, cfg) {
  const targets = [].concat(anno.target).filter(Boolean);
  if (cfg) {
    if (cfg.targetScopeImpliesSource || cfg.findScope) {
      const scopes = targets.map(t => t.scope).filter(Boolean);
      const [scope0] = scopes;
      if (scope0) { return scope0; }
      if (cfg.findScope) { return ''; }
    }
  }
  return findTargetUri(targets[0]);
};


module.exports = EX;
