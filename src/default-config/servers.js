/* -*- tab-width: 2 -*- */
'use strict';


const annoEndpoint = ''; /*
  URL of the Web Annotation Protocol server. Should end with a slash.
  For use with `anno-server-22`'s extended features, omit the `anno/`
  part of its namespace and instead use `annoByIdUrlPrefix`.
*/

const annoByIdUrlPrefix = '';
// ^-- For strictly standards-compliant servers, this should be empty.
// v-- For use with `anno-server-22`'s extended features, instead use one of:
// const annoByIdUrlPrefix = 'as/author/anno/';
// const annoByIdUrlPrefix = 'as/approver/anno/';


const srvCfg = {

  // For URLs that are used only as button targets but not for automated
  //  requests, see `user-interface.js`.

  annoEndpoint,
  annoByIdUrlPrefix,

  annoListSearchPrefix: annoByIdUrlPrefix + 'by/subject_target/', /*
    The sub URL inside `annoEndpoint` to use for search.
    The default value is suitable for `anno-server-22`.
    The `the targetSource` will be appended.
  */

  annoListSearchUrl: '', /*
    An override to ignore `annoListSearchPrefix` and instead give the
    exact sub URL (inside the `annoEndpoint`) to use for search,
    independent of `the targetSource`.
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
    A 2023-09-19 draft version of `anno-server-22` interpreted omission
    of the `creator` field as signal of intent to inherit the previous
    version's `creator` field. (In regards to anno-protocol, this
    would be equivalent to instantly `PATCH`-ing the new annotation.)
    However, relying on this auto-`PATCH`ing behavior impedes compatibility
    with other anno-protocol servers, and is thus discouraged.
  */

};


module.exports = srvCfg;
