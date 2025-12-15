#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function wpw_cli_init () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local REPO_TOP="$(readlink -m -- "$BASH_SOURCE"/../..)"
  set -o errexit -o pipefail
  exec </dev/null

  case "$REPO_TOP" in
    /app ) # probably running in docker
      git config --global --add safe.directory "$REPO_TOP"
      ;;
  esac

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

  chown --recursive --reference dist/{,} 2>/dev/null || true
  wpw_insert_build_info_strings || return $?

  chmod a=r -- "$BUNDLE_DEST_BFN".* || true
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


function wpw_insert_build_info_strings () {
  local MARK_RGX='\b(appBundleMeta:) *\{\}'
  local FILES=()
  readarray -t FILES < <(grep -lPe "$MARK_RGX" -- "$BUNDLE_DEST_BFN".*)
  [ -n "${FILES[0]}" ] || return 0

  local GIT_INFO="$(git log --format="%at %h" -n 10)"
  GIT_INFO="${GIT_INFO//$'\n'/ }"
  local META="{uts:$(date +%s),git:'$GIT_INFO'}"

  chmod u+w -- "${FILES[@]}" || return $?
  LANG=C sed -re "s~$MARK_RGX~\n\1$META\n~" -i -- "${FILES[@]}" || return $?
}










wpw_cli_init "$@"; exit $?
