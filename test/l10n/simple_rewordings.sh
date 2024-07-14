#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function srw_cli_main () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFPATH="$(readlink -m -- "$BASH_SOURCE"/..)"
  cd -- "$SELFPATH" || return $?

  local DF_VOC='../../l10n-config.json'
  local TASK="$1"; shift
  case "$TASK" in
    *.sed ) set -- "$TASK" "$@"; TASK='file';;
  esac
  srw_"$TASK" "$@" || return $?
}


function srw_langtag () {
  exec < <(sed -re 's~^\s+"[a-z]{2,4}":\s*\{$~:&~' -- "$1")
  local BUF= VOC_LANG=
  while IFS= read -rs BUF; do
    case "$BUF" in
      :*:* ) echo "${BUF#:}"; VOC_LANG="${BUF//[^a-z]/}";;
      *'}' | *'},' ) echo "$BUF"; VOC_LANG=;;
      *'"'* ) echo "$VOC_LANG$BUF";;
      * ) echo "$BUF";;
    esac
  done
}


function srw_file () {
  local BFN="$1"
  BFN="${BFN%.}"
  BFN="${BFN%.sed}"
  srw_gen_voc "$BFN" || return $?
  srw_gen_ovr "$BFN" || return $?
}


function srw_gen_voc () {
  local BFN="$(basename -- "$1" .sed)"
  local VOC="$BFN.voc.json"
  srw_langtag "$DF_VOC" | sed -re 's~^([a-z]+)( +"[^<>]+": *")~\2\n<\1> ~' \
    | sed -nrf "$BFN.sed" | sed -re '/": *"$/{N;s~\n<[a-z]+> ?~~}' \
    >"$VOC" || return $?
  if grep -HnPe '\a' -- "$VOC"; then
    echo E: 'Found BEL' >&2
    return 3
  fi
}


function srw_group_vocs_by_key () {
  srw_langtag "$1" | sed -nrf <(echo '
    s~,$~~
    s!^([a-z]+) *("[^<>]*"): *!\2 zz ~\f\n\2 \1 !p
    ') | LANG=C sort --unique
}


function srw_gen_ovr () {
  local BFN="$(basename -- "$1" .voc.json)"
  local VOC="$BFN.voc.json"
  local OVR="$BFN.ovr.json"
  diff -sU 9009009 -- <(srw_group_vocs_by_key "$DF_VOC"
    ) <(srw_group_vocs_by_key "$VOC") | grep -Pe '^\+"|\f$' \
    | tr '\f\n' '\n\f' | sed -nre 's~^\f\+~~p' | sed -nrf <(echo '
    s~\f [^\f]+$~\n  },~
    s~\f\+~,\n~g
    s~^("[^"]+") ~  \1: {\n"" ~
    s~\n("[^"]*") ([a-z]+) ~\n    "\2": ~g
    # s~\n *~ ~g
    1s~^~{ "l10nOverrides": {\n~
    $s~,$~\n}}~
    p
    ') >"$OVR"
}










[ "$1" == --lib ] && return 0; srw_cli_main "$@"; exit $?
