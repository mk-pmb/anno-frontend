const doNothing = Boolean;

const EX = {
  appName: 'ubhdAnnoApp',
  appBundleMeta: {}, // will be inserted at build time.
  configure: doNothing, // to reduce log spam if app definition fails.
};

module.exports = EX;
