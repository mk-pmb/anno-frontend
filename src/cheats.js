'use strict';

const sessionStore = require('./browserStorage.js').session;

const EX = function applyCheats() {
  const annoApp = window.ubhdAnnoApp.getAnnoAppRef();
  const cmd = ((EX.initialHash || '') + (window.location.hash || '')
    ).split('#').filter(Boolean);
  EX.initialHash = '';
  let had = '';
  let hadAny = '';
  if (cmd.includes('RESET')) {
    window.location.hash = '';
    sessionStore.forget(EX.ssSlot);
    had = EX.icons.clear;
    hadAny = true;
  }
  const mem = sessionStore.get(EX.ssSlot) || {};
  Object.keys(EX.codes).forEach(function checkCode(code) {
    let icon = (mem[code] ? 'yes' : 'off');
    if (cmd.includes(code)) {
      mem[code] = true;
      icon = 'add';
      sessionStore.put(EX.ssSlot, mem);
    }
    const func = EX.codes[code];
    had += (had && ' · ') + EX.icons[icon] + ' ' + (func.descr || code);
    if (mem[code]) {
      hadAny = true;
      func(annoApp);
    }
  });
  EX.report = hadAny && had;
  console.debug('ubhdAnnoApp cheats: ' + had);
};

Object.assign(EX, {
  initialHash: window.location.hash,
  ssSlot: 'cheats',
  report: '',
  icons: { clear: '🧹', off: '🚫', add: '💾', yes: '✅' },
  codes: {},
});

function add(c, descr, f) { EX.codes[c] = Object.assign(f, { descr }); }

add('IDDQD', 'UI', a => a.debugReconfigure.ui());
add('IDKFA', 'ACL', a => a.debugReconfigure.acl());
add('xrx', '', a => a.debugReconfigure.xrx());
add('preimg', '', a => a.debugReconfigure.preimg());







module.exports = EX;
