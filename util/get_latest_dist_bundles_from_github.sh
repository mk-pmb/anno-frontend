#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-
set -e
cd -- "$(readlink -m -- "$BASH_SOURCE"/../..)"
exec </dev/null

RLS="$1"; shift || true
BRANCH="$(git branch 2>/dev/null | sed -nre 's~^\* ~~p')" || true
[ -n "$RLS" ] || [ -z "$BRANCH" ] || RLS="ci:$BRANCH" || true
case "$RLS" in
  e ) RLS='ci:experimental';;
  g | '' ) RLS='ci:staging';;
  m ) RLS='ci:master';;
  s ) RLS='ci:stable';;
esac
RLS="${RLS/#ci:/auto-ci-release/}"
[ -n "$BRANCH" ] || BRANCH="${RLS##*[/:]}" || true

BUN='all_dist_bundles.zip'
REPO='mk-pmb/anno-frontend'
REPO_URL="https://github.com/$REPO"

URL="$REPO_URL/actions?query=branch:$BRANCH"
URL+='+is:in_progress'
URL+='+is:queued'
URL+='+is:waiting'

while true; do
  SUITES='(^|\s)id="check_suite_\d+"'
  SUITES="$(curl --silent --show-error -- "$URL" | grep -hoPe "$SUITES" |
    grep -oPe '\d+' | sort --general-numeric-sort --unique)"
  SUITES="${SUITES//$'\n'/ }"
  [ -n "$SUITES" ] || break
  printf '\r%(%T)T %s     ' -1 "waiting for CI: $SUITES"
  sleep 5s
done
echo -ne '\r'

URL="$REPO_URL/releases/download/$RLS/$BUN"
SAVE_AS="tmp.dl-$$.$BUN"
wget --output-document="$SAVE_AS".part -- "$URL"
mv --verbose --no-target-directory -- "$SAVE_AS"{.part,}
( mkdir --parents dist && cd -- dist && unzip -jo ../"$SAVE_AS" )
rm --verbose -- "$SAVE_AS"
echo D: "Success: Updated $PWD/dist <- $URL"
