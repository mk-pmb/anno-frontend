#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-
set -e
cd -- "$(readlink -m -- "$BASH_SOURCE"/../..)"
exec </dev/null
BUN='all_dist_bundles.zip'
REPO='mk-pmb/anno-frontend'
RLS='rolling/auto-ci-release'
URL="https://github.com/$REPO/releases/download/$RLS/$BUN"
ZIP="tmp.dl-$$.$BUN"  
wget --output-document="$ZIP".part -- "$URL"
mv --verbose --no-target-directory -- "$ZIP"{.part,}
( mkdir --parents dist && cd -- dist && unzip -jo ../"$ZIP" )
rm --verbose -- "$ZIP"
