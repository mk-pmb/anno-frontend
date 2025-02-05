export default [
{ "@context": "http://www.w3.org/ns/anno.jsonld",
  "body": {
    "format": "text/html",
    "type": "TextualBody",
    "value": "<p>#1</p>"
  },
  "created": "2023-06-22T16:01:01Z",
  "creator": {
    "id": "urn:uuid:455e5f04-22f9-49b8-95be-dcaea3065654",
    "name": "R. Sterr",
    "type": "Person"
  },
  "dc:dateAccepted": "2023-06-22T16:02:03Z",
  "dc:title": "Erster!!!1! 💯",
  "id": "test-esau-spam-rsterr~1",
  "rights": "https://creativecommons.org/publicdomain/zero/1.0/",
  "target": "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074",
  "type": "Annotation"
},
{ "@context": "http://www.w3.org/ns/anno.jsonld",
  "as:inReplyTo": "test-esau-spam-rsterr",
  "body": {
    "format": "text/html",
    "type": "TextualBody",
    "value": "<p>#2</p>"
  },
  "created": "2023-06-22T16:02:28Z",
  "creator": {
    "id": "urn:uuid:34b816f2-1ddf-4600-9473-dd3d5c297934",
    "name": "Z. Weiter",
    "type": "Person"
  },
  "dc:dateAccepted": "2023-06-22T16:07:30Z",
  "dc:identifier": "https://doi.org/10.82109/anno.frontend.test-esau-spam-zweiter_1",
  "dc:title": "Zweiter! 🏆",
  "id": "test-esau-spam-zweiter~1",
  "motivation": ["replying"],
  "rights": "https://creativecommons.org/publicdomain/zero/1.0/",
  "target": [
    "test-esau-spam-rsterr",
    { "scope": "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0040",
      "dc:title": "Vogel",
      "selector": {
        "type": "SvgSelector",
        "value": "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\"\n  width=\"1258\">\n  <rect x=\"774.5940795650839\" y=\"433.5423868001317\" width=\"66.32386600083214\" height=\"45.53578859758636\" />\n</svg>"
      },
      "source": "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0040/_image"
    },
    { "scope": "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074",
      "dc:title": "Schlangenkopf",
      "selector": {
        "type": "SvgSelector",
        "value": "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\"\n  width=\"1233\">\n  <ellipse cx=\"531.8641431628625\" cy=\"328.241202386446\" rx=\"22.306388526727517\" ry=\"27.676445023902687\"/>\n</svg>"
      },
      "source": "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074/_image"
    },
    { "id": "https://journals.ub.uni-heidelberg.de/index.php/arch-inf/article/view/69356",
      "dc:title": "„Jenseits von Palmyra – Kulturgüterschutz in der Lehre“: Tagungsbilanz der Organisatoren"
    }
  ],
  "type": "Annotation"
},
{ "@context": "http://www.w3.org/ns/anno.jsonld",
  "as:inReplyTo": "test-esau-spam-zweiter",
  "body": {
    "format": "text/html",
    "type": "TextualBody",
    "value": "<p>Aller guten Dinge sind drei.</p>"
  },
  "created": "2023-06-22T16:03:00Z",
  "creator": {
    "id": "urn:uuid:c7057c47-962b-413b-80e0-43bafd4c702d",
    "name": "D. Ritter",
    "type": "Person"
  },
  "dc:isVersionOf": "test-esau-spam-dritter",
  "dc:title": "Dritter!",
  "id": "test-esau-spam-dritter~1",
  "motivation": ["replying"],
  "rights": "https://creativecommons.org/publicdomain/zero/1.0/",
  "target": [
    { "id": "test-esau-spam-zweiter",
      "scope": "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074"
    },
    "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074"
  ],
  "type": "Annotation"
},
{ "@context": "http://www.w3.org/ns/anno.jsonld",
  "as:inReplyTo": "test-esau-spam-rsterr",
  "body": {
    "format": "text/html",
    "type": "TextualBody",
    "value": "<p>✅</p>"
  },
  "created": "2023-06-22T16:05:00Z",
  "creator": {
    "id": "urn:uuid:f85219f1-c280-5c6f-9099-31e4d4ec645f",
    "name": "A. Nym",
    "type": "Person"
  },
  "dc:dateAccepted": false,
  "dc:isVersionOf": "test-esau-spam-warhier",
  "dc:title": "Ich war hier.",
  "id": "test-esau-spam-warhier~1",
  "motivation": ["replying"],
  "rights": "https://creativecommons.org/publicdomain/zero/1.0/",
  "ubhd:anno-user": "arno",
  "target": [
    { "id": "test-esau-spam-rsterr",
      "scope": "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074"
    },
    "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074"
  ],
  "type": "Annotation"
},
{ "@context": "http://www.w3.org/ns/anno.jsonld",
  "body": {
    "format": "text/html",
    "type": "TextualBody",
    "value": "<p>#1</p>"
  },
  "created": "2023-06-22T17:01:05Z",
  "creator": {
    "id": "urn:uuid:455e5f04-22f9-49b8-95be-dcaea3065654",
    "name": "R. Sterr",
    "type": "Person"
  },
  "dc:language": "en-GB",
  "dc:title": "Erster!!!1! 💯",
  "as:deleted": "Fri, 22 Sep 2023 22:02:01 GMT",
  "id": "test-esau-spam-rsterr~2",
  "rights": "https://creativecommons.org/publicdomain/zero/1.0/",
  "target": "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074",
  "type": "Annotation"
},
{ "@context": "http://www.w3.org/ns/anno.jsonld",
  "body": {
    "format": "text/html",
    "type": "TextualBody",
    "value": "<p>#1</p>"
  },
  "created": "2023-06-22T17:01:10Z",
  "creator": {
    "id": "urn:uuid:455e5f04-22f9-49b8-95be-dcaea3065654",
    "name": "R. Sterr",
    "type": "Person"
  },
  "dc:language": "de-DE",
  "dc:title": "Erster!!!1! 💯",
  "id": "test-esau-spam-rsterr~3",
  "rights": "https://creativecommons.org/publicdomain/zero/1.0/",
  "target": {
    "scope": "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074",
    "dc:title": "Vogel",
    "selector": {
      "type": "SvgSelector",
       "value": "<svg xmlns='http://www.w3.org/2000/svg' version='1.1' width='1233'><rect x='822' y='685' width='135' height='162' /><rect x='356' y='693' width='134' height='160' /><rect x='824' y='897' width='132' height='184' /><rect x='358' y='904' width='135' height='185' /></svg>"
    },
    "source": "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074/_image"
  },
  "type": "Annotation"
},
{ "@context": "http://www.w3.org/ns/anno.jsonld",
  "as:inReplyTo": "test-esau-spam-rsterr",
  "body": {
    "format": "text/html",
    "type": "TextualBody",
    "value": "<p>✅ (Edit: Jetzt britisch-englisch.)</p>"
  },
  "created": "2023-06-22T17:15:00Z",
  "creator": {
    "id": "urn:uuid:f85219f1-c280-5c6f-9099-31e4d4ec645f",
    "name": "A. Nym",
    "type": "Person"
  },
  "dc:dateAccepted": false,
  "dc:isVersionOf": "test-esau-spam-warhier",
  "dc:language": "en-GB",
  "dc:title": "Ich war hier.",
  "id": "test-esau-spam-warhier~2",
  "motivation": ["replying"],
  "rights": "https://creativecommons.org/publicdomain/zero/1.0/",
  "ubhd:anno-user": "arno",
  "target": [
    { "id": "test-esau-spam-rsterr",
      "scope": "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074"
    },
    "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074"
  ],
  "type": "Annotation"
},
{ "@context": "http://www.w3.org/ns/anno.jsonld",
  "as:inReplyTo": "test-esau-spam-rsterr",
  "body": {
    "format": "text/html",
    "type": "TextualBody",
    "value": "<p>✅ (Edit: Jetzt deutsch und mit Fake-DOI.)</p>"
  },
  "created": "2023-06-22T17:25:00Z",
  "creator": {
    "id": "urn:uuid:f85219f1-c280-5c6f-9099-31e4d4ec645f",
    "name": "A. Nym",
    "type": "Person"
  },
  "dc:dateAccepted": false,
  "dc:identifier": "https://doi.org/10.1000/182",
  "dc:isVersionOf": "test-esau-spam-warhier",
  "dc:language": "de-DE",
  "dc:title": "Ich war hier.",
  "id": "test-esau-spam-warhier~3",
  "motivation": ["replying"],
  "rights": "https://creativecommons.org/publicdomain/zero/1.0/",
  "ubhd:anno-user": "arno",
  "target": [
    { "id": "test-esau-spam-rsterr",
      "scope": "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074"
    },
    "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074"
  ],
  "type": "Annotation"
},
{ "@context": "http://www.w3.org/ns/anno.jsonld",
  "body": {
    "format": "text/html",
    "type": "TextualBody",
    "value": "<p>Herzlichen Glückwunsch! Sie sind der 1.000.000ste Leser dieser Annotation und haben somit eine gratis Waschmaschine gewonnen! <a href='https://spam.test/'>[Jetzt Gewinn einzulösen!]</a></p>"
  },
  "created": "2023-06-22T17:01:24Z",
  "creator": {
    "id": "urn:uuid:455e5f04-22f9-49b8-95be-dcaea3065654",
    "name": "R. Sterr",
    "type": "Person"
  },
  "dc:dateAccepted": false,
  "dc:language": "de-DE",
  "dc:title": "Sie haben gewonnen!",
  "id": "test-esau-spam-rsterr~4",
  "rights": "https://creativecommons.org/publicdomain/zero/1.0/",
  "target": "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074",
  "type": "Annotation"
},
{ "@context": "http://www.w3.org/ns/anno.jsonld",
  "as:inReplyTo": "test-esau-spam-rsterr",
  "body": {
    "format": "text/html",
    "type": "TextualBody",
    "value": "<p align=\"right\">Ḩ̷͖͓̪̠̲̘̬͉̿͛̅̔͘͟͠ė̴̬̯̪̻̞̃̉̃́͗̆͗̚͜͞ c̷̨̘̜͉͙̳͇̆͒̎̃̄̌̽̉̚͞o̶̡̱̝̱̩̓̓͐͐̈́͋͜m̴̛͔̮̯͔̥̗̟̀͗́̈͂͛͟͞ę̸̡̞̭̦͕̥̺̎͗̆̀͆̐͝s̵̛̞̫̬̫̦̯̲͇̳͛͒̒́̃.̨̲̱͕͔̼̓̅̽̄̋̈</p>"
  },
  "created": "2023-06-22T18:42:23Z",
  "creator": {
    "id": "urn:uuid:5743e023-fc0c-4ca7-bb43-7982361f83fe",
    "name": "Z. Algo",
    "type": "Person"
  },
  "dc:dateAccepted": false,
  "dc:isVersionOf": "test-esau-spam-hecomes",
  "dc:title": "H̡̪̘͕̞̱̬̀̉͂͊̽̀̏̚͝e͕̱͈̲̯̙̽̽͌͂̅͘͜͡ c̢̧̰͓̣͍̩͑̽̄̊̉̑̃̏o͎̹̱̤̞̾̀͌̉̀͗͘m̥̩̮̱̩͇̙̑̒̔̏͂́̋̾͘͢e̸̗̗̝̞̗͓̜̣̪̐͐̋̆̃́̂̉͑͠s͙̙̦͚̠̻̣̼͛̽̈́͛̾̋̾̓.̹͇̝͙̈́̒̊̊̍͟͡",
  "id": "test-esau-spam-hecomes~1",
  "motivation": ["replying"],
  "rights": "https://creativecommons.org/publicdomain/zero/1.0/",
  "ubhd:anno-user": "arno",
  "target": [
    { "id": "test-esau-spam-rsterr",
      "scope": "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074"
    },
    "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074"
  ],
  "type": "Annotation"
},
{ "@context": "http://www.w3.org/ns/anno.jsonld",
  "as:inReplyTo": "test-esau-spam-hecomes",
  "body": {
    "format": "text/html",
    "type": "TextualBody",
    "value": "<p align=\"right\">Ḩ̨̰͈̙̯͉͚̐̔̐́̈̄e̸̲̫͕̬̫͇͓͚̫͌͂̂̽͂̽̀͊̕̚ w̖̼̹̜̙̼͇̫̽͆́́̾͊͘ͅä͓̫̪̖̦̯̮̥̺́̾́̀̃̕̚ͅī̵̧͔̭̝͍̱̣̬͈̾̅̉͟͡t̙͉̱̲̠͇͇́̀́͑͘͠s̸̨̜̹͍͚͚͇̪̅͑̓͌͢͜͞͡͡͡ b̡̧̰̬̗̪́̆̊͊̾̇̚͠e̷̛͍̗̫͉̣͎̺̋̇͊̍̊͛͘͘h̡̬̞̱̥̽͗̾̔̀͑̂̑͞͡i̧̹̥̣̯̬̊͗̈́͆͐̾͆̆̄͂ņ̵̻̦̭̞̠̭͚̫̔͆̏̍̈̚̚͢d̢̩̥̟̙͍̜͎͙̾̎͌̀́̀̽̌͡ͅ ţ̴͙͉͕̩̩̭̺̠̊̋̉̀̾́̎̑̅̚͟ḥ̸̢̭̗̯̌͐̂͗̒̑̐e̴̡̢̠̣͖̜̰͇̽͑̏́̆̒̽͌ ẉ̵͉̹̳̏̊͊͌͂̈̒̑̏͜ą̵̨̡̛͕̥̦̠̤̻̟̋̈̇́̚͞l̵͕̲̗̱̿̉͊̓̀̉͛̈̀͢l̷̨̛̘̖̤̤̠͎̀̑̾̃͒̆̐̇͟͜͜͠.̶͈̼̳̻̩͎̍́̂̾̚̕͜͞͝ͅ</p>"
  },
  "created": "2023-06-22T18:42:42Z",
  "creator": {
    "id": "urn:uuid:5743e023-fc0c-4ca7-bb43-7982361f83fe",
    "name": "Z. Algo",
    "type": "Person"
  },
  "dc:dateAccepted": false,
  "dc:isVersionOf": "test-esau-spam-hewaits",
  "dc:title": "H͓͚̼̙̼͍̺̗̝̑͌̾̍́̉e̡̛̗̯̪̋́̌͐̍͐̏̚͜͠ ŵ͚̳̝̭͈̗̬̅̈́͒͠a̷̲̻̗͍͎̻͍̯̐͐̓̄͋i̸̡̱̦͖̬̹̓̎̔̒̾͌̚t̼̭̬͔̓̋̅̀͢͟͝͠ş̡̭̟̝̹̠̥͖̂̀͆͛͘͢ b̷̧̨̛͖̟͕͇̤̲͇͆͛͑͐͗̑͟͞e̡̢͕̯͇̗͋̎̔͒̂͜͞͡h̡̬̗͙͙̱̜̜̦͂̈́̎̍̆̉̅̄͞į̹̖̪̥͎̹̦̔̐̈̎̑̍͋̓͒͟ņ͇̬̝̆̀̂͑̔͐͜͜ḏ̴̞̤̟̟͔͛̀͑̆̌̂͒̈̚͞ t̷͙̖͕͍̝̍̌̌͂́́̒̀͜͢͡ḩ̸̨̨̛̛̬̥̮̝̿͊͒͘͝͞é̡̨̖̼͂̈́͜͟͝͞ ẇ̢̧̻̟͎̼̹͋͑̾͐̍͂̀͢͟ȁ̢̧̺̼͓͎͐̔̑͢͝ļ̢͉͖̫̮̮̗͚͂̈́̈͑͒ľ̠̪̱̠̜̩̻͖̓̒̄̆̀͟͜.̷͙̗̤̠̫̓͊͒͡͝",
  "id": "test-esau-spam-hewaits~1",
  "motivation": ["replying"],
  "rights": "https://creativecommons.org/publicdomain/zero/1.0/",
  "ubhd:anno-user": "arno",
  "target": [
    { "id": "test-esau-spam-hecomes",
      "scope": "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074"
    },
    "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074"
  ],
  "type": "Annotation"
},
{ "@context": "http://www.w3.org/ns/anno.jsonld",
  "body": {
    "format": "text/html",
    "type": "TextualBody",
    "value": "<p>Zu Risiken und Nebenwirkungen lesen Sie das Buch Genesis oder fragen Sie Ihren Bischof oder Pfarrer.</p>"
  },
  "created": "2024-07-22T00:10:00Z",
  "creator": {
    "id": "urn:uuid:ad51f9a8-6319-4023-8946-d829f6c65a4f",
    "name": "Mose et al.",
    "type": "Person"
  },
  "dc:isVersionOf": "test-esau-moses-fruit",
  "dc:language": "de-DE",
  "dc:title": "Verbotene Früchte",
  "id": "test-esau-moses-fruit~1",
  "rights": "https://creativecommons.org/publicdomain/zero/1.0/",
  "ubhd:anno-user": "arno",
  "target": {
    "scope": "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074",
    "selector": {
      "type": "SvgSelector",
      "value": "<svg xmlns='http://www.w3.org/2000/svg' version='1.1' width='1233'><circle cx='593' cy='388' r='14'/><ellipse cx='525' cy='348' rx='0' ry='0'/><ellipse cx='537' cy='360' rx='18' ry='14'/></svg>"
    },
    "source": "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074/_image"
  },
  "type": "Annotation"
},
{ "@context": "http://www.w3.org/ns/anno.jsonld",
  "body": {
    "format": "text/html",
    "type": "TextualBody",
    "value": "<p>… ist ihm im Hals stecken geblieben.</p>"
  },
  "created": "2024-07-22T00:10:00Z",
  "creator": {
    "id": "urn:uuid:ad51f9a8-6319-4023-8946-d829f6c65a4f",
    "name": "Mose et al.",
    "type": "Person"
  },
  "dc:isVersionOf": "test-esau-moses-adamsapfel",
  "dc:language": "de-DE",
  "dc:title": "Adams Apfel",
  "id": "test-esau-moses-adamsapfel~1",
  "motivation": ["commenting"],
  "rights": "https://creativecommons.org/publicdomain/zero/1.0/",
  "ubhd:anno-user": "arno",
  "target": {
    "scope": "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074",
    "selector": {
      "type": "SvgSelector",
      "value": "<svg xmlns='http://www.w3.org/2000/svg' version='1.1' width='411'><polygon points='136,115 136,121 145,128 151,119 151,113 140,113' /></svg>"
    },
    "source": "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074/_image"
  },
  "type": "Annotation"
},
null];
