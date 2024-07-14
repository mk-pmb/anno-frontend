#!/bin/sed -nurf
# -*- coding: UTF-8, tab-width: 2 -*-

: copy
  p;n
  /^<de>/b lang_de
  /^<en>/b lang_en
b copy


: lang_de
  s~(^|iese) Annotationen\b~\1 Kommentare~g
  s~(^|iese| auf) Annotation\b~\1r Kommentar~g
  s~(^|ale|Neue) Annotation\b~\1n Kommentar~g
  s~ Die Annotation ~ Der Kommentar ~g
  s~(^|er) Annotation\b~es Kommentars~g
  s~ keine Annotationen\b~ keine Kommentare~g
  s~ zur ([a-z]+en) Annotation\b~ zum \1 Kommentar~g
  s~ Annotation (wird|kann|ist|erstellt) \b~ Kommentar \1 ~g
  s~ Annotationen (werden|konnten) \b~ Kommentare \1 ~g
  s~ Anno(tiere)~ Kommen\1~g
b verify


: lang_en
  s~ (Annotation)(s?)\b~ Comment\2~g
  s~ (annotation)(s?)\b~ comment\2~g
  s~ (Annotate)\b~ Comment~g
  s~ (annotate)\b~ comment~g
b verify


: verify
  s~annot~\a&~ig
b copy
