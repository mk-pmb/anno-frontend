// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const api22 = require('../../api22.js');


const EX = async function simpleDateStamp(viewer, origStampSpec, annoIdUrl) {
  if (!annoIdUrl) {
    const url = viewer.annoIdUrl;
    if (url) { return EX(viewer, origStampSpec, url); }
    throw new Error('No anno ID given!');
  }
  const patchData = {
    action: 'add_stamp',
    // In case of a string primitive, use that as type:
    type: origStampSpec,
    // Otherwise, we expect an object with a type attribute. In that case,
    // the previous type assignment was wrong and we immediately amend it:
    ...(origStampSpec.type && origStampSpec),
  };
  const debugTrace = { simpleDateStamp: patchData.type, annoIdUrl };
  console.log(debugTrace, 'querying.');
  try {
    await api22(viewer.$store.state).aepPatch('://' + annoIdUrl, patchData);
    window.location.reload();
  } catch (err) {
    console.error(debugTrace, 'failed:', err);
    return window.alert(viewer.l10n('error:') + '\n' + err);
  }
};


module.exports = EX;
