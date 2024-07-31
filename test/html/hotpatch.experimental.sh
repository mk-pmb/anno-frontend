#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function reex () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFPATH="$(readlink -m -- "$BASH_SOURCE"/..)"
  # cd -- "$SELFPATH" || return $?

  local ITEM=
  local JSLINT=()
  local ESLINT=()
  for ITEM in "$@"; do
    case "$ITEM" in
      cfg.*.js ) JSLINT+=( "$ITEM" );;
      *.js ) ESLINT+=( "$ITEM" );;
    esac
  done
  [ -z "$JSLINT" ] || jsl -- "${JSLINT[@]}" || return $?
  [ -z "$ESLINT" ] || elp -- "${ESLINT[@]}" || return $?

  local DEST="$SELFPATH"/../../.git/@/htdocs/experimental/test/html/
  cp --verbose --target-directory="$DEST" -- "$@" || return $?
}










[ "$1" == --lib ] && return 0; reex "$@"; exit $?
