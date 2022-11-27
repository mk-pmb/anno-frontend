// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const crc32 = require('lighter-crc32');
const isStr = require('is-string');

function padStart(pad, text) { return (pad + text).slice(-pad.length); }


function guessPrimaryTargetUri(anno) {
  const t0 = [].concat(anno.target).filter(Boolean);
  return (t0.source || t0.id /* Anno ID */ || t0);
}


function weaklyHashAnnoDraft(text) {
  /*
    This hash is meant to guard against accidential conflict between two
    drafts saved by users of the same group within the same second of
    user's local system clock.

    This scenario seems to be very unlikely in the first place, but
    it might be plausible when a user worked with multiple tabs open,
    then decides to take a break and quickly cycles through all tabs
    to click "save draft" in each of them.

    A content-based hash seems best because in case of a collision,
    the resulting deduping is probably beneficial.

    The hash is not meant to defend against an evil-minded hash collision
    attack, since an attacker could just send an explicit DAV request
    rather than tricking users into submitting a draft at the same time.

    My first idea was to crack a nut with a sledgehammer and just use
    a few bytes of SHA-512, giving tons more collision resistance than
    we'd likely ever need.
    However, I couldn't find a useful SHA implementation that reliably
    works in browsers:
    * The `SubtleCrypto` web API only works on pages loaded via HTTPS.
      I can somewhat understand browser vendor paranoia about cryptographic
      data being handled unsafely, but that paranoia isn't justified for
      our mere content hashing scenario.
      It's totally ok to use plain HTTP in a trusted LAN environment,
      which is one potential environment that we should support.
    * The `rusha` package works nicely in Firefox but fails with
      `out of memory` in my Waterfox, making me doubt which other
      browsers might not be compatible.

    Fortunately, since we don't need strong collision resistance,
    a simple checksum like CRC32 might be good enough.
    (And even better with a shorthand for empty text.)
  */
  if (!text) { return '0'; }
  if (!isStr(text)) {
    const json = JSON.stringify(text);
    if (json === '[]') { return '0'; }
    if (json === '{}') { return '0'; }
    return weaklyHashAnnoDraft(json);
  }
  return padStart('00000000', crc32(text).toString(16));
}


function weaklyHashUri(uri) {
  /*
    I have no idea whether CRC is a good enough hash for anno and target
    URIs. Failure means our users will see the draft in a wrong category.
    That's low enough risk to just use the same hash…
  */
  return weaklyHashAnnoDraft(uri);
  /*
    … and postpone consideration until it turns out to be an actual problem.
  */
}


function fileNameHashes(anno) {
  return {
    target: weaklyHashUri(guessPrimaryTargetUri(anno)),
    annoIdUrl: weaklyHashUri(anno.id),
  };
}


module.exports = {
  fileNameHashes,
  guessPrimaryTargetUri,
  weaklyHashAnnoDraft,
  weaklyHashUri,
};
