#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function help_button_topics () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFPATH="$(readlink -m -- "$BASH_SOURCE"/..)"
  cd -- "$SELFPATH" || return $?

  exec </dev/null
  local SCAN_RGX='<(help-button|bootstrap-tab)'
  local SED_EXTRACT_TAGS='
    \"^'"$SCAN_RGX"'$"{
      : read_more
      />/!{
        N
        b read_more
      }
      s~\t~ ~g
      s~\s*\n\s*~\t~g
      s~(\t[:a-z]+="[^"]*)\t~\1 ~g
      s~\s*/?\s*>$~~
      p
    }
    '
  local SED_SORTED='
    s~^<help-button topic="([^"]+)"~:\1~
    /^<bootstrap-tab /{
      /\stopic=/!d
      s~ :title="(l10n)\(\x27([a-z]+)\x27\)"(\s.*|)$~\3 \1=\2~
      s~ (:name|:title|ref|tab-[a-z-]+|:visible|v-if)="[^"]+"~~g
      s~"~~g
      s~^<bootstrap-tab topic=~:~
      s~^(:\S+) *(l10n=)~\1\t#\2~
    }
    '
  local FILE= DEST= SED_CUSTOM=
  for FILE in $(git grep -lPe "$SCAN_RGX" ../..); do
    SED_CUSTOM='p'
    case "$FILE" in
      *.sh ) continue;;
      */bootstrap-tabs.html ) SED_CUSTOM='
        /^<help-button\b.* :topic="/b;p';;
    esac
    echo "=== $FILE ==="
    LANG=C sed -zre 's~>~\n&\n~g; s~<(\S+)~\n&\n~g' -- "$FILE" |
      sed -re 's~^\s+~~; s~\s+$~~' | sed -nrf <(echo "$SED_EXTRACT_TAGS") |
        sort_attrs | sed -rf <(echo "$SED_SORTED") |
        sed -nrf <(echo "$SED_CUSTOM") | sort -Vu
  done
}


function sort_attrs () {
  local LN=
  while IFS= read -rs LN; do
    echo -n " ${LN//$'\t'/$'\n'}" | LANG=C sort | tr -s '\t\n ' ' ' | cut -b 2-
  done
}










help_button_topics "$@"; exit $?
