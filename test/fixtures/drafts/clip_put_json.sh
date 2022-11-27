#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function clip_put_json () {
  local SELFPATH="$(readlink -m -- "$BASH_SOURCE"/..)"
  cd -- "$SELFPATH" || return $?

  local CLIP="$(xclip -selection clipboard -out)"
  local QUOT='"' APOS="'"
  CLIP="${CLIP//$QUOT/}"
  CLIP="${CLIP#$QUOT}"
  CLIP="${CLIP%$QUOT}"
  local RGX='^>([0-9a-z_-]+\.json) \{'
  [[ "$CLIP" =~ $RGX ]] || return 2$(echo "E: No filename detected" >&2)
  local SAVE_FN="${BASH_REMATCH[1]}"
  CLIP="${CLIP#* }"
  CLIP="${CLIP//$APOS/$QUOT}"
  CLIP="${CLIP//¶/$'\n'}"
  echo -n "$CLIP" >"$SAVE_FN"

  local CRC_WANT="$SAVE_FN"
  CRC_WANT="${CRC_WANT##*-*-*-*-}"
  CRC_WANT="${CRC_WANT%%.*}"
  CRC_WANT="${CRC_WANT%%-*}"
  local CRC_RCVD="$(crc32 /dev/stdin <"$SAVE_FN")"
  if [ "$CRC_WANT" == "$CRC_RCVD" ]; then
    echo -n "CRC ok."
  else
    echo -n "CRC bad = $CRC_RCVD != $CRC_WANT"
  fi
  echo -n $'\tsize: '
  du --bytes -- "$SAVE_FN"
}










clip_put_json "$@"; exit $?
