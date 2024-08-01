/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, browser: true */
/* -*- tab-width: 2 -*- */
(function setDefaultTestConfig() {
  'use strict';
  window.ubhdAnnoApp.configure({

    makeDebugLogger: Function.bind.bind(console.debug, console),

    iiifUrlTemplate: ('http://iiif.anno.test/someProjectName'
      + ':_image/%ir/full/0/default.jpeg'),
    debugIiifBounds: true,

    uiDebugMode: true,

    targetSource: ('http://anno.test/' + location.pathname.replace(/^\S+\//,
      '').replace(/\.\S+$/, '')),

  });

  function onVersionSelected(event) {
    console.debug('Version selected:', event);

    /* For debugging, it may be helpful to export the event so you can
      more easily inspect it in the browser console: */
    window.versionSelectedEvent = event;

    // No UI changes required for invisible changes:
    if (!event.sideVisible) { return; }

    /* One of the first things this handler should do is to retract any
      outdated UI components. This way, if one of the next steps has some
      obscure bug that throws an exception, users at least will know that
      something broke, rather than rely on outdated visual displays. */
    // window.mainApp.clearTargetPreviews();

    /* Webdesign best practice is to have the initial website view rendered
      server-side (see "Why SSR?"[1]). With SSR, the webserver would request
      the annotation internally and would be able to determine and configure
      the target correctly in the initial AnnoApp config.
      [1] https://vuejs.org/guide/scaling-up/ssr.html

      However, for debugging, we'd prefer using only static HTML pages.
      We thus start with a degraded initial config, condone a misconfigured
      target and then fix it later.
      The frontend has a convenience method to do this fix-up: */
    event.adjustConfiguredTargetSource();

    /* In scenarios with target previews, we should now render the
      preview components for the new targets. */
    // const subjectTargets = evt.categorizeTargets().subjects;
    // subjectTargets.forEach(window.mainApp.addTargetPreview);
  }

  window.ubhdAnnoApp.configure({
    initCmpOnVersionSelected: onVersionSelected,
  });

}());
