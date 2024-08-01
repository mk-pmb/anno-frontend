// -*- coding: utf-8, tab-width: 2 -*-
/* eslint-env browser */
'use strict';

window.jQuery().ready(function installLate() {
  const { testUtil } = window;
  // const jq = window.jQuery;
  const cfg = window.ubhdAnnoApp.configure();
  const { annoEndpoint } = cfg;
  const annoEndpointAbs = (new URL(annoEndpoint, document.URL)).href;

  const panel = testUtil.addTestsPanel('Custom Request');
  const tpl = testUtil.makeSlotTplFuncs({
    txf: '<input type="text" name="¤" size="¤" value="¤">',
    txa: ('<p>¤:<br><textarea name="¤" cols="80" rows="10" wrap="off"'
      + ' class="code"></textarea></p>'),
  });
  panel.addForm(`
    <p>Method: ${tpl.txf('verb', 8, 'POST')}
      Endpoint: ${tpl.txf('subUrl', 30, 'anno/')}</p>
    <p>Content-Type: ${tpl.txf('cType', 30,
      'application/json; charset=UTF-8')
      } ${testUtil.makeCkbLabel('auto-fix JSON')}</p>
    ${tpl.txa('Raw body text to be sent', 'bodyTxa')}
    ${tpl.txa("Server's response", 'rspTxa')}
  `, function setup(form) {
    const { bodyTxa, rspTxa, cType, autoFixJson } = form.elements;
    autoFixJson.checked = true;

    function setRsp(m) {
      rspTxa.value = '[' + testUtil.localTimeHr() + '] ' + m;
    }

    bodyTxa.onblur = function fx() {
      const tx = bodyTxa.value;
      if (!tx.startsWith('//!= {')) { return; }
      let ovr = tx.split(/\n/)[0];
      const cut = ovr.length + 1;
      ovr = ovr.trim().replace(/^\S+/, '');
      try { ovr = JSON.parse(ovr); } catch (e) { return !e; }
      Object.keys(ovr).forEach(k => { form.elements[k].value = ovr[k]; });
      bodyTxa.value = tx.slice(cut);
    };

    async function submit() {
      let data = bodyTxa.value;
      const mainCType = cType.value.split(/;/)[0];
      if ((mainCType === 'application/json') && autoFixJson.checked) {
        data = data.replace(/[\s\);]+$/, '');
        data = data.replace(/^export default \(?/, '');
        data = data.replace(/,(?=\s*\})/g, '');
      }
      const request = {
        method: form.elements.verb.value,
        url: annoEndpointAbs + form.elements.subUrl.value,
        contentType: cType.value,
        data,
        dataType: 'text', // <-- don't auto-parse response
      };
      setRsp('(Sending…)');
      const resp = await testUtil.ajax2str(request);
      setRsp(resp);
    }

    testUtil.topRightSubmitButton(panel, [
      { v: 'Fixtures', href: '../fixtures/' },
      submit,
    ]);
  });
});
