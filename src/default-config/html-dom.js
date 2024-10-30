/* -*- tab-width: 2 -*- */
'use strict';

const domCfg = {

  // For bootstrap default config see `../bootstrap-compat.js`.

  prefix: 'anno-app-',
  // ^-- Prefix used for various DOM element `id`s.

  container: '…container', /*
    Reference to, or id of, the DOM element into which to install
    the sidebar app.
    A leading `…` (U+2026 horizontal ellipsis) will be replaced with
    the `prefix` setting.
  */

  modalTeleportTarget: null, /*
    Reference to, or id of, the DOM element into which to install
    modal popups. `null` = auto-detect.
  */


  additionalTargetsHintLinkFrame: '', /*
    Which frame to open the link in that informs about an annotation having
    additional targets. Use '' for same frame and '_blank' for new window/tab.
  */



};


module.exports = domCfg;
