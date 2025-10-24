'use strict';

const isStr = require('is-string');

const guessPrimaryTargetUriImpl = require('../guessPrimaryTargetUri.js');
const strU = require('../stringUtil.js');

function orf(x) { return x || false; }


const MT = {

  annoIdToPermaUrl(annoIdOrVersId) {
    /*
      The "perma" here is meant to be the canonical URL that people can
      bookmark and share. Ideally it should tend to be short and also be
      somewhat permanent, even if less strictly than a DOI would be.
    */
    if (!annoIdOrVersId) { return ''; }
    const { state } = this.$store;
    let url = state.purlTemplate;
    if (!url) { return '#!missingConfig:purlTemplate!' + annoIdOrVersId; }
    const versionIdentifier = strU.fileBaseName(annoIdOrVersId);

    // %sl and {{ slug }} are deprecated and will be dropped soon!
    url = url.replace('%sl', versionIdentifier);
    url = url.replace('{{ slug }}', versionIdentifier);

    url = url.replace('%ep', state.annoEndpoint);
    url = url.replace('%ri', versionIdentifier);

    return url;
  },


  findResourceUrlNaive(res) {
    if (!res) { return ''; }
    if (isStr(res)) { return res; }
    if (isStr(res.id)) { return res.id; }
    if (isStr(res.source)) { return res.source; }
    return '';
  },


  findResourceUrl(res) {
    const url = MT.findResourceUrlNaive(res);
    if (!url) { return url; }
    if (!/^[a-z]/i.test(url)) {
      const msg = ('Expected resource URL to start with a letter :'
        + JSON.stringify(url)
        + ' – Original Resource was: '
        + JSON.stringify(res));
      throw new Error(msg);
    }
    return url;
  },


  guessPrimaryTargetUri(anno) {
    return guessPrimaryTargetUriImpl(anno, this.$store.state);
  },


  findVersNumFromAnnoUrl(url) {
    if (!url) { return 0; }
    return (+orf(this.$store.state.versionSuffixRgx.exec(url))[1] || 0);
  },


};




module.exports = {
  methods: MT,
};
