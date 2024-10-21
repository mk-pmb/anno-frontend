(function setupDigiZoneEditor() {
  'use strict';
  const annoAppLurkReason = 'externalTargetEditor';
  let digiProjPage = false;

  window.jQuery().ready(function getDigiRef() {
    digiProjPage = ((window.heiImageViewer
      && (window._digiCurrentView === 'VIEW_PROJECT_PAGE')
      && window.DigiProjectPage
      && (window.app instanceof window.DigiProjectPage)
      && window.app) || false);
  });

  function doneEditing() {
    window.ubhdAnnoApp.abortLurkMode(annoAppLurkReason);
  }

  function startExternalTargetEditor(event) {
    const target = event.annoTarget;
    if (!target) { throw new Error('No target to edit!'); }
    if (!digiProjPage) { throw new Error('Not running in DigiProjectPage!'); }
    if (!event.replaceExistingContent) {
      throw new Error('Expected option replaceExistingContent!');
    }
    digiProjPage.startSvgZoneEditing({
      domContainer: event.domContainer,
      initialSvg: ((target.selector || false).value || ''),
      onDone: doneEditing,
      onUpdated(newSvg) {
        let selector = null;
        if (newSvg) { selector = { type: 'SvgSelector', value: newSvg }; }
        window.ubhdAnnoApp.externalRequest('UpdateEditorTarget', { selector });
      },
    });
  }


  window.ubhdAnnoApp.configure({
    events: {
      startExternalTargetEditor,
      abortExternalTargetEditor() { digiProjPage.stopSvgZoneEditing(); },
    },
  });
}());
