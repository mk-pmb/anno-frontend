'use strict';

const isStr = require('is-string');


function annoIdToPermaUrl(annoIdOrVersId) {
  /*
    The "perma" here is meant to be the canonical URL that people can
    bookmark and share. Ideally it should tend to be short and also be
    somewhat permanent, even if less strictly than a DOI would be.
  */
  if (!annoIdOrVersId) { return ''; }
  const { state } = this.$store;
  let url = state.purlTemplate;
  if (!url) { return '#!missingConfig:purlTemplate!' + annoIdOrVersId; }
  const versionIdentifier = annoIdOrVersId.split('/').slice(-1)[0];

  // %sl and {{ slug }} are deprecated and will be dropped soon!
  url = url.replace('%sl', versionIdentifier);
  url = url.replace('{{ slug }}', versionIdentifier);

  url = url.replace('%ep', state.annoEndpoint);
  url = url.replace('%ri', versionIdentifier);

  return url;
}


function findResourceUrl(res) {
  if (!res) { return ''; }
  if (isStr(res)) { return res; }
  return (res.id || res.source || '');
}



module.exports = {
  methods: {
    annoIdToPermaUrl,
    findResourceUrl,
  },
};
