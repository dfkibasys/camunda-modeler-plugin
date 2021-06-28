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
            "name": "component-id",
            "isAttr": true,
            "type": "String"
          },
          {
            "name": "capability",
            "isAttr": true,
            "type": "String"
          }
        ]
      }
    ]
  }

export default basysModdleDescriptor;