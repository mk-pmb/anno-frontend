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
  "target": { "id": "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074" },
  "type": ["Annotation"]
},
{ "@context": "http://www.w3.org/ns/anno.jsonld",
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
    {
      "id": "test-esau-spam-rsterr",
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
    {
      "id": "test-esau-spam-zweiter",
      "scope": "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074"
    },
    { "id": "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074" }
  ],
  "type": ["Annotation"]
},
{ "@context": "http://www.w3.org/ns/anno.jsonld",
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
    {
      "id": "test-esau-spam-rsterr",
      "scope": "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074"
    },
    { "id": "https://digi.ub.uni-heidelberg.de/diglit/cpg148/0074" }
  ],
  "type": ["Annotation"]
},
];
