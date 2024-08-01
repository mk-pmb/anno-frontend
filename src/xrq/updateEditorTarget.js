/* -*- tab-width: 2 -*- */
'use strict';

function orf(x) { return x || false; }


async function update(store, origParam) {
  const { editor } = this.annoApp;
  const { fragment, selector } = orf(origParam);
  const { type: selType, value: selVal, ...selOther } = orf(selector);
  console.debug('Anno-Frontend: Received editor target update:',
    { fragment, selType, selVal, selOther });
  if (!selector) {
    editor.setZoneSelector('');
    return;
  }
  if (selType === 'SvgSelector') { editor.setZoneSelector(selVal); }
}


module.exports = {
  doUpdateEditorTarget: update,
};
