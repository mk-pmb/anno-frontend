// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const getOwn = require('getown');

const l10nCfg = require('../../l10n-config.json');

const langCodesMap = l10nCfg.langcode;
const dfLangCode = l10nCfg.defaultlang;


function l10n(cfg, vocKey, fallback) {
  if (vocKey && vocKey.startsWith('<')) {
    return vocKey.replace(/<([ -;=@-~]+)\s*>/g,
      (m, k) => m && l10n(cfg, k, fallback));
  }

  const { localizations } = cfg;
  const bestLang = cfg.language;
  const normalizedBestLangCode = getOwn(langCodesMap, bestLang);

  const localOverride = getOwn(cfg.l10nOverrides, vocKey);
  if (localOverride) {
    const voc = getOwn(localOverride, bestLang, localOverride['*']);
    if (voc !== undefined) {
      return voc;
    }
  }

  const bestLangDict = getOwn(localizations, normalizedBestLangCode);
  const bestVoc = getOwn(bestLangDict, vocKey);
  if (bestVoc) { return bestVoc; }

  const dfLangDict = getOwn(localizations, dfLangCode);
  const dfLangVoc = getOwn(dfLangDict, vocKey);
  if (dfLangVoc) { return dfLangVoc; }
  if (fallback !== undefined) { return fallback; }
  return vocKey;
}


module.exports = {
  methods: {
    l10n(...args) { return l10n(this.$store.state, ...args); },
  },
};
