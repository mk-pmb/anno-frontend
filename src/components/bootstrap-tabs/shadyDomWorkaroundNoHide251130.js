'use strict';

const waName = 'shadyDomWorkaroundNoHide251130';

const waMsg = ('Anno-Frontend: Bootstrap-Tabs: '
  + "The previously active tab(s) didn't hide properly. "
  + 'If this happens in the Waterfox browser with the ShadyDOM shim active, '
  + 'this is a known side effect. As a mitigation, '
  + waName + ' will fire switchToNthTab(…) internally.');

function retab() {
  const tabMgr = this;
  const nActive = (tabMgr.$refs.tabs.querySelectorAll('.nav-link.active')
    || false).length;
  if (nActive <= 1) { return; }

  const now = Date.now();
  if (retab.nextMsgNotBefore < now) {
    retab.nextMsgNotBefore = now + 10e3;
    console.debug(waMsg);
  }

  tabMgr.switchToNthTab(tabMgr.currentActiveTabIndex + 1);
}

retab.nextMsgNotBefore = 0;

module.exports = { methods: { [waName]: retab } };
