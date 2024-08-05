'use strict';

const lurkReason = 'externalTargetEditor';

let digiProjPage = false;
window.jQuery().ready(function getDigiRef() {
  digiProjPage = ((window.heiImageViewer
    && (window._digiCurrentView === 'VIEW_PROJECT_PAGE')
    && window.DigiProjectPage
    && (window.app instanceof window.DigiProjectPage)
    && window.app) || false);
});


function doneEditing() { window.ubhdAnnoApp.abortLurkMode(lurkReason); }

function startExternalTargetEditing(event) {
  console.debug('DOM container for target editing:', event.domContainer);
  const target = event.annoTarget;
  let descr = JSON.stringify(target, null, 2);
  const selType = (target.selector || false).type;
  if (selType === 'SvgSelector') {
    descr = 'these SVG zones:\n\n' + target.selector.value;
  }
  descr = 'AnnoApp wants the external target editor to edit ' + descr;
  if (!window.confirm(descr)) { return doneEditing(); }
  if (selType !== 'SvgSelector') { return; }

  window.debugSvg = target.selector.value;
  console.debug('window.debugSvg has been set.'
    + ' Modify and run window.debugUpdateTarget() to submit changes,'
    + ' finally window.debugZoneEditorDone().');

  if (digiProjPage) {
    const zoneEditorLayer = new window.heiImageViewer.Layer({
      name: 'annotation_zone_editor_layer',
      display: 'always',
      color: '#008800',
      features: [{
        name: 'input_feature',
        shapes: [{ format: 'svg', source: window.debugSvg }],
      }],
    })
    digiProjPage.drawing.addLayer(zoneEditorLayer);
    window.debugZoneEditorLayer = zoneEditorLayer;
  }
}

function abortExternalTargetEditing() {
  window.alert('AnnoApp wants the external target editor to abort editing.');
}


Object.assign(window, {

  debugZoneEditorDone: doneEditing,

  debugUpdateTarget() {
    const svg = window.debugSvg;
    const targetUpdate = { selector: { type: 'SvgSelector', value: svg } };
    window.ubhdAnnoApp.externalRequest('UpdateEditorTarget', targetUpdate);
  },

});



window.ubhdAnnoApp.configure({
  events: {
    startExternalTargetEditing,
    abortExternalTargetEditing,
  },
});
