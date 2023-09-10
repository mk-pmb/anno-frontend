// -*- coding: utf-8, tab-width: 2 -*-

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
  const t0 = targets[0];
  if (!t0) { return ''; }
  return (t0.source || t0.id /* Anno ID */ || t0 || '');
};


module.exports = EX;
