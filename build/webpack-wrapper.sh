#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function wpw_cli_init () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local REPO_TOP="$(readlink -m -- "$BASH_SOURCE"/../..)"
  set -o errexit -o pipefail
  exec </dev/null

  local AUDIENCE='dev'
  case "$1" in
    --audience=* ) AUDIENCE="${1#*=}"; shift;;
  esac
  [ "$#" == 0 ] || return 4$(
    echo E: $FUNCNAME: "Unexpected CLI arguent(s): $*" >&2)

  local BUNDLE_DEST_BFN='dist/anno-frontend'
  case "$AUDIENCE" in
    dev )
      # Remove all old bundles, mostly to not leave behind a confusing
      # deprecated prod bundle.
      rm --verbose --one-file-system -- "$BUNDLE_DEST_BFN".* || true
      ;;
  esac

  local WP_ENV=(
    WEBPACK_AUDIENCE="$AUDIENCE"
    )
  [ "$REPO_TOP" != /app ] || WP_ENV+=(
    NODE_OPTIONS='--openssl-legacy-provider'
    )
  echo D: "webpack for $AUDIENCE:"
  env "${WP_ENV[@]}" ./node_modules/.bin/webpack

  du --human-readable -- "$BUNDLE_DEST_BFN".*
  sha1sum --binary -- "$BUNDLE_DEST_BFN".*

  local BAD_RGX='$x'
  # BAD_RGX+='|/app/\b' # enable this for false-positive testing
  BAD_RGX+='|/home/\b'
  BAD_RGX+='|/mnt/\b'
  BAD_RGX='[ -~]{0,30}('"$BAD_RGX"')[ -~]{0,30}'
  local GREP='grep --color=always -m 10 -HaboPe'
  ! LANG=C $GREP "$BAD_RGX" -- "$BUNDLE_DEST_BFN".* >&2 || return 4$(
    echo E: "Found suspicious strings in dist/ files, see above." >&2)
}










wpw_cli_init "$@"; exit $?
