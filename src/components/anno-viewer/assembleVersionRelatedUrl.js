// -*- coding: utf-8, tab-width: 2 -*-

const guessPrimaryTargetUri = require('../../guessPrimaryTargetUri.js');
const strU = require('../../stringUtil.js');

function str(x) { return String(x || ''); }


const EX = function assembleVersionRelatedUrl(cfg, tplKeyPrefix, anno) {
  const slots = {};
  /*
  ############################################################
  ##                                                        ##
  ##   Available placeholders:                              ##
  ##                                                        ##
  ############################################################ */

  // %ID  = Anno's ID (usually a full URL)
  // %id  = last path segment of %ID = everything behind the farthest slash.
  slots['%ID'] = str(anno.id);
  slots['%id'] = strU.fileBaseName(slots['%ID']);

  // %VO  = dc:isVersionOf
  // %vo  = last path segment of dc:isVersionOf
  slots['%VO'] = str(anno['dc:isVersionOf']);
  slots['%vo'] = strU.fileBaseName(slots['%VO']);

  // %tu   First target URL
  slots['%tu'] = guessPrimaryTargetUri(anno);

  // %sc   First target scope
  slots['%sc'] = guessPrimaryTargetUri(anno, { findScope: true });


  const tplOrig = str(cfg[tplKeyPrefix + 'UrlTemplate']);
  const url = tplOrig.replace(/%\w{2}/g, m => (slots[m] || m));
  return url;
};


Object.assign(EX, {

  asVueMethod(tplKeyPrefix) {
    return EX(this.$store.state, tplKeyPrefix, this.annotation);
  },

});


module.exports = EX;
