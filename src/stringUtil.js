// -*- coding: utf-8, tab-width: 2 -*-

const isStr = require('is-string');

function arrLast(a) { return ((a && a.length) ? a[a.length - 1] : undefined); }


const EX = {

  strSplitAtLast(mark, text) {
    if (!isStr(text)) { return false; }
    const l = text.lastIndexOf(mark);
    return (l >= 0 ? [text.slice(0, l), text.slice(l + 1)] : [text]);
  },


  fileBaseName(path) { return arrLast(EX.strSplitAtLast('/', path)); },




};





module.exports = EX;
