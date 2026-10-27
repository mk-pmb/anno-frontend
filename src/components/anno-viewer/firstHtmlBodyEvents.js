// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const jq = window.jQuery;


const EX = {

  install(viewer) {
    const fhbt = jq(viewer.$refs.firstHtmlBodyTag);
    fhbt.getViewerVueElem = Object.bind(null, viewer);
    fhbt.on('click', 'a[href]', evt => EX.linkClicked(
      { evt, fhbt, viewer, tgt: evt.currentTarget }));
  },


  cancelEvent(ctx) {
    ctx.evt.preventDefault();
    ctx.evt.stopPropagation();
  },


  linkClicked(ctx) {
    ctx.hrefAttr = ctx.tgt.getAttribute('href');
    if (!ctx.hrefAttr) { return; }
    ctx.hrefUrl = ctx.tgt.href;
    if (!ctx.hrefUrl) { return; }
    EX.maybeFtnRefFootnoteClicked(ctx);
  },


  maybeFtnRefFootnoteClicked(ctx) {
    const a = /^(#_ftn)(ref|)(\d\w*)$/.exec(ctx.hrefAttr);
    if (!a) { return; }
    EX.cancelEvent(ctx);
    const b = a[1] + (a[2] ? '' : 'ref') + a[3];
    const e = ctx.fhbt.find('a[href="' + b + '"]')[0];
    console.debug('Anno-Frontend:', 'FtnRefFootnoteClicked:', { a, b, e });
    if (e) { e.scrollIntoView({ block: 'center' }); }
  },


};




module.exports = EX;
