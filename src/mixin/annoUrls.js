'use strict';

function annoIdToPermaUrl(annoIdOrRevId) {
  /*
    The "perma" here is meant to be the canonical URL that people can
    bookmark and share. Ideally it should tend to be short and also be
    somewhat permanent, even if less strictly than a DOI would be.
  */
  if (!annoIdOrRevId) { return ''; }
  const { state } = this.$store;
  let url = state.purlTemplate;
  if (!url) { return '#!missingConfig:purlTemplate!' + annoIdOrRevId; }
  const revisionIdentifier = annoIdOrRevId.split('/').slice(-1)[0];

  // %sl and {{ slug }} are deprecated and will be dropped soon!
  url = url.replace('%sl', revisionIdentifier);
  url = url.replace('{{ slug }}', revisionIdentifier);

  url = url.replace('%ep', state.annoEndpoint);
  url = url.replace('%ri', revisionIdentifier);

  return url;
}

module.exports = {
  methods: {
    annoIdToPermaUrl,
  },
};
