// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const api22 = require('../../api22.js');
const eventBus = require('../../event-bus.js');

const stampApiPathPrefix = require('./stampApiPathPrefix.js');


const EX = async function simpleDateStamp(viewer, origStampSpec, annoIdSpec) {
  if (!origStampSpec.type) {
    return EX(viewer, { type: origStampSpec }, annoIdSpec);
  }
  const versId = (annoIdSpec || viewer.annoIdUrl
    || '').replace(/^\S*\//, '');
  if (!versId) { throw new Error('No anno version ID or URL given!'); }
  const patchData = {
    action: 'addStamp',
    // In case of a string primitive, use that as type:
    type: origStampSpec,
    // Otherwise, we expect an object with a type attribute. In that case,
    // the previous type assignment was wrong and we immediately amend it:
    ...(origStampSpec.type && origStampSpec),
  };

  const { state } = viewer.$store;
  const pathPrefix = stampApiPathPrefix.find(state, patchData);
  const patchUrl = state.annoByIdUrlPrefix + pathPrefix + versId;

  const debugTrace = { simpleDateStamp: patchData.type, versId, patchUrl };
  console.log(debugTrace, 'querying.');
  try {
    await api22(state).aepPatch(patchUrl, patchData);
  } catch (err) {
    console.error(debugTrace, 'failed:', err);
    window.alert(viewer.l10n('error:') + '\n' + err);
    throw err;
  }
  eventBus.$emit('simpleDateStampSucceeded', {
    eventWasHandled: false,
    versId,
    patchUrl,
    patchData,
  });
};


module.exports = EX;
