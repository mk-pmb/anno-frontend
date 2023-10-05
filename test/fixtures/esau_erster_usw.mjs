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
  "type": ["Annotation"]
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
  "type": ["Annotation"]
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
  "type": ["Annotation"]
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
  "type": ["Annotation"]
},
{ "@context": "http://www.w3.org/ns/anno.jsonld",
  "body": {
    "format": "text/html",
    "type": "TextualBody",
    "value": "<p>#1</p>"
  },
  "created": "2023-09-22T16:02:01Z",
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
  "type": ["Annotation"]
},
{ "@context": "http://www.w3.org/ns/anno.jsonld",
  "body": {
    "format": "text/html",
    "type": "TextualBody",
    "value": "<p>#1</p>"
  },
  "created": "2023-09-22T16:02:01Z",
  "creator": {
    "id": "urn:uuid:455e5f04-22f9-49b8-95be-dcaea3065654",
    "name": "R. Sterr",
    "type": "Person"
  },
  "dc:language": "de-DE",
  "dc:title": "Erster!!!1! 💯",
  "id": "test-esau-spam-rsterr~3",
  "rights": "https://creativecommons.org/publicdomain/zero/1.0/",
  "target": "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074",
  "type": ["Annotation"]
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
  "type": ["Annotation"]
},
{ "@context": "http://www.w3.org/ns/anno.jsonld",
  "as:inReplyTo": "test-esau-spam-rsterr",
  "body": {
    "format": "text/html",
    "type": "TextualBody",
    "value": "<p>✅ (Edit: Jetzt deutsch.)</p>"
  },
  "created": "2023-06-22T17:25:00Z",
  "creator": {
    "id": "urn:uuid:f85219f1-c280-5c6f-9099-31e4d4ec645f",
    "name": "A. Nym",
    "type": "Person"
  },
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
  "type": ["Annotation"]
},
null];
