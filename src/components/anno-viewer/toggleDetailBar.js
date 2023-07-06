// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const jq = require('jquery');


function maybeImportHtml(jqBar, refs) {
  const dests = jqBar.find('[html-src-ref]');
  if (!dests[0]) { return; }
  dests.each(function importHtml(idx, dest) {
    const srcRef = dest.getAttribute('html-src-ref');
    const html = ((refs[srcRef] || false).innerHTML || '');
    dest.innerHTML = html; // eslint-disable-line no-param-reassign
  });
}


const EX = function toggleDetailBar(ev) {
  const viewer = this;
  const barName = (ev.barName
    || jq(ev.target).closest('button').data('detailbar'));
  if (!barName) { throw new Error('No detailbar name'); }
  const detBars = viewer.$refs.detailbars;
  const openCls = 'active';
  const jqBar = jq(detBars.querySelector('.detailbar-' + barName));
  if (!jqBar[0]) { throw new Error('No such detailbar: ' + barName); }
  const jqButton = jq(viewer.$el.querySelector('button[data-detailbar="'
    + barName + '"]'));
  const jqButtonAndBar = jq().add(jqButton).add(jqBar);
  let wantOpen = ev.barWantOpen;
  if ((wantOpen === 'toggle') || (wantOpen === undefined)) {
    const wasOpen = jqButton.hasClass(openCls);
    wantOpen = !wasOpen;
  }
  if (wantOpen) {
    jqButtonAndBar.addClass(openCls);
    maybeImportHtml(jqBar, viewer.$refs);
  } else {
    jqButtonAndBar.removeClass(openCls);
    maybeImportHtml(jqBar, false);
  }
};




module.exports = EX;
