/* -*- tab-width: 2 -*- */
'use strict';
/* eslint-env browser */

const axios = require('axios');
const getOwn = require('getown');

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
  function constructRequestUri(endpointName, subUrl) {
    if ((!subUrl) && (subUrl !== '')) {
      throw new Error('No endpoint sub URL given');
    }
    const epBaseUrl = getOwn(vueStoreState, endpointName + 'Endpoint');
    if (!epBaseUrl) {
      throw new Error('Endpoint URL not configured for ' + endpointName);
    }

    if (subUrl.startsWith('://')) {
      // ^- Internal notation for: We expect the remainder to be an
      //    absolute URI within the endpoint namespace.
      const url = subUrl.slice(3);
      if (!url.startsWith(epBaseUrl)) {
        const msg = ('API boundary error: The URI is not inside the '
          + endpointName + ' endpoint namespace:\n' + url + '\n' + epBaseUrl);
        throw new Error(msg);
      }
      return url;
    }

    return epBaseUrl + subUrl;
  }

  async function endpointRequest(endpointName, method, subUrl, data) {
    const url = constructRequestUri(endpointName, subUrl);
    try {
      const result = await axios({ ...defaultAxiosOpts, method, url, data });
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
    constructRequestUri,
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
