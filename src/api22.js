/* -*- tab-width: 2 -*- */
'use strict';
/* eslint-env browser */

const axios = require('axios');

function ucFirst(s) { return s.slice(0, 1).toUpperCase() + s.slice(1); }

const supportedHttpMethods = [
  'get',
  'post',
];


const defaultAxiosOpts = {
  // maxRedirects: 0, // doesn't work in Firefox anyway
  withCredentials: 1, // without it, xhr won't set cookies for CORS
};


const EX = function apiFactory(vueStoreState) {
  async function endpointRequest(endpointName, method, subUrl, data) {
    if (!subUrl) { throw new Error('No endpoint sub URL given'); }
    try {
      const result = await axios({
        ...defaultAxiosOpts,
        method,
        url: vueStoreState[endpointName + 'Endpoint'] + subUrl,
        data,
      });
      return result.data;
    } catch (err) {
      const rsp = (err.response || false);
      if (rsp.status && rsp.statusText && rsp.data) {
        const msg = (rsp.status + ' ' + rsp.statusText + '\n' + rsp.data);
        const aug = new Error(msg);
        Object.assign(aug, err);
        throw aug;
      }
      throw err;
    }
  }

  const api = {
    endpointRequest,
  };

  supportedHttpMethods.forEach(function add(method) {
    // Define aepGet, aepPost etc.:
    const key = 'aep' + ucFirst(method);
    api[key] = endpointRequest.bind(null, 'anno', method);
  });

  return api;
};



// Object.assign(EX, {});
module.exports = EX;
