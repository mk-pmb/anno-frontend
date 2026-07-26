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

  const { decision, trace } = EX.lookupAclEntry(appCfg, subjTgt, privName);
  if (decision === undefined) { return false; }
  if (decision === 'allow') { return true; }
  if (decision === 'deny') { return false; }

  const err = new TypeError('AnnoApp: Unsupported ACL permission value'
    + ' for privilege ' + privName
    + ' for subject target URL ' + subjTgt
    + ' via trace<' + trace.join(' | ') + '>'
    + ': ' + (typeof decision) + ' ' + String(decision));
  err.aclLookup = { subjTgt, privName, trace, decision };
  console.error(err);
  throw err;
};


Object.assign(EX, {

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


  lookupAclEntry(appCfg, subjTgt, privName) {
    const searchOrder = [
      ['aclOverrides', subjTgt, privName],
      ['aclOverrides', subjTgt, '*'],
      ['aclOverrides', '*', privName],
      ['aclOverrides', '*', '*'],
      ['acl', subjTgt, privName],
      ['acl', subjTgt, '*'],
      ['acl', '*', privName],
      ['acl', '*', '*'],
    ];
    let trace;
    let decision;
    const fails = [];
    searchOrder.every(function s(path) {
      /* Without Vue proxy interference, this would be as simple as
            decision = lodash.get(appCfg, path);
        but since Vue spams the console with errors, we have to trace them
        to at least try and debug them.
      */
      try {
        trace = [];
        decision = path.reduce(function nextStep(from, key) {
          if (!from) { return; }
          const val = getOwn(from, key);
          trace.push(key);
          trace.push('=' + (val && typeof val));
          return val;
        }, appCfg);
      } catch (aclLookupErr) {
        fails.push({
          msg: String(aclLookupErr),
          getOrigErr: () => aclLookupErr,
          path: path.join('|'),
          dived: trace.join('|'),
        });
      }
      return (decision === undefined);
    });
    if (fails.length) {
      console.warn('Anno-Frontend: Had errors while doing benign ACL lookups'
        + ' => probably some weird Vue proxy interference:', ...fails);
    }
    return { decision, trace };
  },


});


EX.knownStampNames = [
  '_ubhd:doiAssign',
  'as:deleted',
  'dcterms:dateAccepted',
];


EX.knownPrivilegeNames = [
  'create',
  'reply',
  ['any', 'own'].map(w => [
    'revise_' + w,
    EX.knownStampNames.map(s => 'stamp_' + w + '_add_' + s.replace(':', '_')),
  ]),
].flat(9).sort();








module.exports = EX;
