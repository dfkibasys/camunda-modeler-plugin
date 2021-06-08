let basysModdleDescriptor = {
    "name": "Basys",
    "prefix": "basys",
    "uri": "http://basys",
    "xml": {
      "tagAlias": "lowerCase"
    },
    "associations": [],
    "types": [
      {
        "name": "BasysTask",
        "extends": [
          "bpmn:Task"
        ],
        "properties": [
          {
            "name": "id-short",
            "isAttr": true,
            "type": "String"
          }
        ]
      }
    ]
  }

export default basysModdleDescriptor;