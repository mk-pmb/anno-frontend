#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-
#
# This is mostly for running webpack.
# Webpack is very greedy by default, optimizing for time-to-finish on
# non-interactive dev-ops infrastructure. Thus, on a developer machine,
# we need to tame it a lot. For details on ulimit, see
# https://serverfault.com/a/773734#773734


function run_tamed () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  set -o pipefail -o errexit

  if [ "$CI" == true ]; then
    # Running on a CI server = Optimizing for speed is acceptable.
    exec "$@"; return $?
  fi
  [ "$#" -ge 1 ] || set -- bash -i

  local NICENESS=15 # inverse priority; 15 = very low priority
  local MAX_MEMORY_MB=2048

  # Unfortunately, most of the other stuff isn't applicable:
  local MAX_UNSWAPABLE_MEMORY_MB=1024
  local MAX_PROCESSES=32000
  local MAX_THREADS=4

  # ulimit -e $NICENESS
  # ^-- usually no permission, so instead we use the "nice" command below.

  # ulimit -l $(( MAX_UNSWAPABLE_MEMORY_MB * 1024 )) # Operation not permitted
  # ulimit -T $MAX_THREADS # -T: invalid option (even though man page has it)
  # ulimit -u $MAX_PROCESSES # Operation not permitted
  ulimit -v $(( MAX_MEMORY_MB * 1024 ))
  set -- nice --adjustment=$NICENESS "$@"

  exec "$@" || return $?
}







run_tamed "$@"; exit $?
