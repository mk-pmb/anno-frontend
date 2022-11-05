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


const EX = function apiFactory(state) {
  const {
    annoEndpoint,
  } = state;

  const api = {
  };

  async function annoEndpointRequest(method, subUrl, data) {
    if (!subUrl) { throw new Error('No endpoint sub URL given'); }
    const result = await axios({
      ...defaultAxiosOpts,
      method,
      url: annoEndpoint + subUrl,
      data,
    });
    return result.data;
  }

  supportedHttpMethods.forEach(function add(method) {
    // Define aepGet, aepPost etc.:
    api['aep' + ucFirst(method)] = annoEndpointRequest.bind(null, method);
  });

  return api;
};



// Object.assign(EX, {});
module.exports = EX;
