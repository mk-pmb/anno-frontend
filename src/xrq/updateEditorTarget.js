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
    const k = 'debugConfirmXrqEraseSelector';
    if (store.state[k]) {
      const msg = (k + '?\n' + (new Error(k + '?')).stack
        ).replace(/\n/g, '\n\n');
      if (!window.confirm(msg)) { return; }
    }
    editor.setZoneSelector('');
    return;
  }
  if (selType === 'SvgSelector') { editor.setZoneSelector(selVal); }
}


module.exports = {
  doUpdateEditorTarget: update,
};
