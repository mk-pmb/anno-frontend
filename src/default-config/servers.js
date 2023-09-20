/* -*- tab-width: 2 -*- */
'use strict';

const srvCfg = {

  // For URLs that are used only as button targets but not for automated
  //  requests, see `user-interface.js`.

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

  annoEndpoint: '', /*
    URL of the Web Annotation Protocol server. Should end with a slash.
  */
  draftStoreEndpoint: '', /*
    URL of a WebDAV collection. Should end with a slash.
  */

  purlTemplate: [
    /* Template for generating persistent anno URLs. For details, see
      `../mixin/annoUrls.js`.
    */

    '%ep', // annoEndpoint
    'anno/',
    '%ri', // version identifier
  ].join(''),

  authorIdentityOmitToPreserve: false, /*
    A 2023-09-19 draft version of `anno-server-22` interpreted omission of
    the `creator` field as signal of intent to inherited the previous
    version's `creator` field. (In regards to anno-protocol, this
    would be equivalent to instantly `PATCH`-ing the new annotation.)
    However, relying on this auto-`PATCH`ing behavior impedes compatibility
    with other anno-protocol servers, and is thus discouraged.
  */

};


module.exports = srvCfg;
