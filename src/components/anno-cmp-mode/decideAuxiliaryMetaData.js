// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

function parseDateIf(x) { return (x && new Date(x)); }


const EX = function decideAuxiliaryMetaData(anno, { l10n, dateFmt }) {
  if (!anno) { return false; }
  const aux = {};

  aux.sunsetDate = parseDateIf(anno['as:deleted']);
  aux.sunny = true;
  if (aux.sunsetDate) {
    aux.sunny = (Date.now() < aux.sunsetDate.getTime());
    aux.sunsetVoc = (aux.sunny ? 'sunny_until:' : 'sunset_since:');
    aux.sunsetDescr = (l10n(aux.sunsetVoc) + ' '
      + (dateFmt(aux.sunsetDate) || l10n('date_time_unknown')));
  }

  return aux;
};




module.exports = EX;
