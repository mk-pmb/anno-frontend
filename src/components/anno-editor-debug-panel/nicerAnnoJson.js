// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */


const EX = function nicerAnnoJson(orig) {
  let j = orig;
  j = j.replace(/\{\n\s*("\w+":)\s*(\S[ -\uFFFF]*)\n\s*\}/g, '{ $1 $2 }');
  j = j.replace(/\[\n\s*(\S[ -\uFFFF]*)\n\s*\]/g, '[$1]');
  return j;
};


module.exports = EX;
