// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

function parseDateIf(x) { return (x && new Date(x)); }


const EX = function decideAuxiliaryMetaData(anno) {
  if (!anno) { return false; }
  const aux = {};

  aux.sunsetDate = parseDateIf(anno['as:deleted']);
  aux.sunny = true;
  if (aux.sunsetDate) {
    aux.sunny = (Date.now() < aux.sunsetDate.getTime());
    aux.sunsetVoc = (aux.sunny ? 'sunny_until:' : 'sunset_since:');
  }

  return aux;
};




module.exports = EX;
