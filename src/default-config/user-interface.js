/* -*- tab-width: 2 -*- */
'use strict';

const l10nConfig = require('../../l10n-config.json');

const uiCfg = {

  // For HTML/DOM specific stuff, see `html-dom.js`.

  initAppMode: 'list',
  // ^- 'list' = annotation list (default)
  //    'cmp' = comparison view / print view

  loginRegistrationFormUrl: null,
  loginFormUrl: null,

  logoutPageUrl: null, /*
    URL where the logout button should lead to.
    Use the special URL "fake://insecure" to have the logout button just
    make the anno app just pretend the session has ended, without notifying
    the session server about the user's attempt to invalidate it.
  */

  permissionsRequestFormUrl: null,
  permissionsRequestAllowGuest: false,

  helpUrlTemplate: [
    /* Template for generating help URLs. For details, see
      `../components/help-button/help-url.js`.
    */

    'https://anno.ub.uni-heidelberg.de/anno/dist/help/digi/',
    '%hl',      // hl = <h>elp <l>anguage
    '/.well-known/',
    '%nv',      // nv = topic <n>aming scheme <v>ersion identifier
    '/help_button_topics/',
    '%ht',      // ht = <h>elp <t>opic
    '.html',
  ].join(''),

  offerCreateNewAnnotationButton: true,

  versionsButtonUrlTemplate: '?cmp1=%id',
  // ^- For supported placeholders, see
  //    src/components/anno-viewer/assembleVersionRelatedUrl.js

  printViewButtonUrlTemplate: '?viewMode=print&cmp1=%id',
  // ^- Same placeholders as for `versionsButtonUrlTemplate`.
  //    Set to empty string to hide the button.

  doiHidesPurlButton: true,
  purlAnnoInitiallyOpen: true,
  /* ^-- In case the app was loaded via a persistent URL of an annotation,
      whether that annotation shall be visible initially, potentially by
      opening parent threads. */
  purlId: null,
  /* ^-- In case the app was loaded via a persistent URL of an annotation,
      that annotation's ID. Should begin with the URL of `annoEndpoint`. */


  targetFragmentButtonTitle: null, /*
    Hover title (not caption) of the Fragment Identifier button.
    Usually, this should be a description of what the
    `targetFragmentButtonClicked` event handler does. (see `events.md`) */

  replyDisplayStyle: 'nested',
  // How to display replies: 'flat' or 'nested'



  language: l10nConfig.defaultlang,
  // ^-- One of the language codes supported in the l10nConfig,
  //    e.g. `de` for German or `en` for English.

  localizations: l10nConfig.localizations,

  annoLanguageOptions: [
    /*
      For BCP 47 see: https://en.wikipedia.org/wiki/IETF_language_tag

      For the labels, we use Unicode flags to save on graphics (page load
      time) and because we can expect that accessibility software understands
      them. You can copy and paste the flag codes from this list:
      https://en.wikipedia.org/wiki/Regional_indicator_symbol

      The default list is sorted alphabetically in an attempt to not convey
      any cultural preference. In production you may want to re-order them
      by how often they are used in your actual use case.
    */
    { bcp47: 'de-DE', label: '🇩🇪' },
    { bcp47: 'en-GB', label: '🇬🇧' },
    { bcp47: 'en-US', label: '🇺🇸' },
  ],


  targetEditorTabVoc: 'zones', /*
    Vocablulary item to use for the target editor tab. Empty = disable. */

  disableXrxVueEditor: false, /*
    Disable the legacy zone editor in case it causes too severe problems. */











};


module.exports = uiCfg;
