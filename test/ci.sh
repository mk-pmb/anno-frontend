#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function ci_test () {
  local REPO_DIR="$(readlink -m -- "$BASH_SOURCE"/../..)"
  cd -- "$REPO_DIR" || return $?
  [ -f 'webpack.config.js' ] || return $?$(
    echo 'E: Failed to determine REPO_DIR' >&2)

  npm install --global npm@7 || return $?
  npm install . || return $?

  ### BEGIN ### Hotfix for vue2-teleport issue 13 (2025-10-23) ###
  sed -re 's~( map: \{"version":3,"sources":\["/)[A-Za-z/]+'$(
    )'(/vue2-teleport/src/)~\1…\2~g' -i \
    -- node_modules/vue2-teleport/dist/teleport.*
  ### ENDOF ### Hotfix for vue2-teleport issue 13 (2025-10-23) ###

  npm run build || return $?
  npm test || return $?
}


ci_test "$@"; exit $?
