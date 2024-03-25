// -*- coding: utf-8, tab-width: 2 -*-

const getOwn = require('getown');


const EX = function checkAclAuth(appCfg, opt, overrideSubjTgt) {
  if (typeof opt === 'string') {
    return EX(appCfg, { privName: opt }, overrideSubjTgt);
  }
  let { privName, subjTgt } = (opt || false);
  if (!privName) { throw new Error('Empty privilege name'); }
  if (overrideSubjTgt) { subjTgt = overrideSubjTgt; }
  if (opt.isOwnAnno !== undefined) {
    const { isOwnAnno, ...pnAnyOpt } = opt;
    pnAnyOpt.privName = privName.replace(/‹own›/g, 'any');
    if (checkAclAuth(appCfg, pnAnyOpt)) { return true; }
    if (!isOwnAnno) { return false; }
    privName = privName.replace(/‹own›/g, 'own');
  }
  if (!EX.knownPrivilegeNames.includes(privName)) {
    return EX.apiError('Unsupported privilege name: ' + privName);
  }
  if (subjTgt === undefined) {
    // The upcoming "or empty string" is there to avoid infinite recursion.
    subjTgt = appCfg.targetSource;
  }
  if (!subjTgt) {
    // return EX.apiError('No subject target URL, privName=' + privName);
    return false;
  }

  const searchPriorities = [
    ['aclOverrides', subjTgt, privName],
    ['aclOverrides', subjTgt, '*'],
    ['aclOverrides', '*', privName],
    ['aclOverrides', '*', '*'],
    ['acl', subjTgt, privName],
    ['acl', subjTgt, '*'],
    ['acl', '*', privName],
    ['acl', '*', '*'],
  ];
  let found;
  let trace;
  searchPriorities.every(function s(sp) {
    trace = sp;
    found = getOwn(getOwn(getOwn(appCfg, sp[0]), sp[1]), sp[2]);
    // console.debug(EX.name, sp, { privName, found, subjTgt });
    return (found === undefined);
  });
  // console.debug(EX.name, { privName, subjTgt, found }, opt);
  if (found === undefined) { return false; }
  if (found === 'allow') { return true; }
  if (found === 'deny') { return false; }

  const err = new TypeError('AnnoApp: Unsupported ACL permission value'
    + ' for privilege ' + privName
    + ' for subject target URL ' + subjTgt
    + ' via trace<' + trace.join(' | ') + '>'
    + ': ' + (typeof found) + ' ' + String(found));
  err.aclLookup = { subjTgt, privName, trace, found };
  console.error(err);
  throw err;
};


Object.assign(EX, {

  knownPrivilegeNames: [
    'create',
    'reply',
    'revise_any',
    'revise_own',
    'stamp_any_add__ubhd_doiAssign',
    'stamp_any_add_as_deleted',
    'stamp_any_add_dc_dateAccepted',
    'stamp_own_add__ubhd_doiAssign',
    'stamp_own_add_as_deleted',
    'stamp_own_add_dc_dateAccepted',
  ],


  apiError(descr) {
    const msg = 'AnnoApp ACL lookup error: ' + descr;
    console.error(msg);
    // throw new Error(msg);
    return false;
  },


  vueMixin: {
    methods: {
      checkAclAuth(...args) { return EX(this.$store.state, ...args); },
    },
  },


});





module.exports = EX;
