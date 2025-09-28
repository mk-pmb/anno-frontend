#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-

function build_cli () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local REPO_TOP="$(readlink -m -- "$BASH_SOURCE"/../..)"
  cd -- "$REPO_TOP" || return $?
  exec </dev/null

  local LINT_BEFORE_BUILD=+
  if [ "$1" == --no-lint ]; then LINT_BEFORE_BUILD=; shift; fi

  local FLAVOR="${1:-all}"; shift
  build_"$FLAVOR" "$@" || return $?
}


function build_lint () {
  echo 'Lint…'
  local LINT_CMD=(
    ./node_modules/.bin/eslint
    --ext='js,mjs'
    --
    src/
    *.js
    )
  SECONDS=0
  "${LINT_CMD[@]}" || return $?
  echo "Linter had no complaints, took $SECONDS sec."
}


function build_all () {
  build_dev || return $?
  build_prod || return $?
}


function build_maybe_lint () {
  [ -n "$LINT_BEFORE_BUILD" ] || return 0
  build_lint || return $?
  LINT_BEFORE_BUILD=
}


function build_common () {
  build_maybe_lint || return $?
  local TAME=
  [ "$(nice)" -ge 1 ] || [ "$REPO_TOP" -ef /app ] ||
    TAME='./build/run_tamed.sh'
  $TAME ./build/webpack-wrapper.sh --audience="$WEBPACK_AUDIENCE" || return $?
}


function build_dev () {
  WEBPACK_AUDIENCE='dev' build_common || return $?
}


function build_prod () {
  WEBPACK_AUDIENCE='prod' build_common || return $?
}






build_cli "$@"; exit $?
