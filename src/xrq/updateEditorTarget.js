/* -*- tab-width: 2 -*- */
'use strict';

function orf(x) { return x || false; }


async function update(store, origParam) {
  const { fragment, selector } = orf(origParam);
  console.debug('Anno-Frontend: Received editor target update:',
    { fragment, selector }, 'Selector value:', orf(selector).value);
}


module.exports = {
  doUpdateEditorTarget: update,
};
