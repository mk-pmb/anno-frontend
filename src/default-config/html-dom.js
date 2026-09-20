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


  pluginsNodeModulesUrl: '/node_modules/', /*
    ^-- used in some places for the `plugnm://` pseudo-protocol */


  injectCustomHtmlByAnnoIdUrl: false, /*
    You may inject raw HTML above and below annotations. Danger zone!
    To use this feature, set it to a dictionary object in format
    { '*': { above: '', below: '' } }.
    The '*' URL is the default for annos that don't have their own settings.
    Vue will modify your object in-place to install observers, so later updates
    to your object should take effect as soon as the anno is re-rendered (e.g.
    when its hover state changes). */



};


module.exports = domCfg;
