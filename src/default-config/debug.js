/* -*- tab-width: 2 -*- */
'use strict';

const annoDebugCfg = {

  uiDebugMode: false,
  // ^-- Whether to display additional UI components for easier debugging.


  debugPretendIsLoggedIn: null, /*
    `null`:   Login checks use server-sent session information.
    `true`:   Pretend to always be logged in.
    `false`:  Pretend to always be guest.
    */


};


module.exports = annoDebugCfg;
