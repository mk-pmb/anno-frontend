#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-
set -e
echo '### BEGIN ### Work-around for is-string issue 29 ###'

cd -- node_modules/is-string
TSC='@ljharb/tsconfig'
[ -s node_modules/"$TSC"/tsconfig.json ] || npm install --dev "$TSC"

echo '### ENDOF ### Work-around for is-string issue 29 ###'
