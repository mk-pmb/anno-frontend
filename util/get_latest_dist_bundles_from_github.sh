#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-
set -e
cd -- "$(readlink -m -- "$BASH_SOURCE"/../..)"
exec </dev/null

RLS="$1"; shift || true
[ -n "$RLS" ] || RLS="$(git branch 2>/dev/null |
  sed -nre 's~^\* ~ci:~p')" || true
case "$RLS" in
  e ) RLS='ci:experimental';;
  g | '' ) RLS='ci:staging';;
  m ) RLS='ci:master';;
  s ) RLS='ci:stable';;
esac
RLS="${RLS/#ci:/auto-ci-release/}"

BUN='all_dist_bundles.zip'
REPO='mk-pmb/anno-frontend'
URL="https://github.com/$REPO/releases/download/$RLS/$BUN"
ZIP="tmp.dl-$$.$BUN"
wget --output-document="$ZIP".part -- "$URL"
mv --verbose --no-target-directory -- "$ZIP"{.part,}
( mkdir --parents dist && cd -- dist && unzip -jo ../"$ZIP" )
rm --verbose -- "$ZIP"
echo D: "Success: Updated $PWD/dist <- $URL"
