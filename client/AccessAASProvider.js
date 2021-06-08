'use strict';

import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import axios from 'axios';

let options = [];
const LOW_PRIORITY = 500;

// Create the custom Basys tab.
// The properties are organized in groups.
function createBasysTabGroups(element, translate) {

  // Create a group called "Component".
  var idShortGroup = {
    id: 'component',
    label: 'Component',
    entries: []
  };

  // Add the props to the id short group.
  getProps(idShortGroup, element, translate);

  return [
    idShortGroup
  ];
}

function AccessAASProvider(propertiesPanel, translate) {
  let self = this;

  propertiesPanel.registerProvider(LOW_PRIORITY, this);

  getAssets.then(assets => {

    for (let i = 0; i < assets.length; i++){
      options.push({name: assets[i], value: assets[i]})
    }

    self.getTabs = function(element) {
      return function(entries) {

        // Add the "Basys" tab
        var basysTab = {
          id: 'basys',
          label: 'Basys',
          groups: createBasysTabGroups(element, translate)
        };
  
        entries.push(basysTab);
    
        // Show general + "Basys" tab
        return entries;
      }

    };

  }).catch(err => {
    console.error(err)
  })

};

let getAssets = new Promise((resolve, reject) => 
  {
    let assets = [];
    axios.get("http://10.2.10.4:4000/api/v1/registry")
    .then(res => {
      for (let i = 0; i < res.data.length; i++) {
        assets.push(res.data[i].asset.idShort);
      }
      resolve(assets);
    })
    .catch(err => {
      reject(err);
    })
  });

let getProps = function(group, element, translate) {

  // Only return an entry, if the currently selected
  // element is a task event.

  if (is(element, 'bpmn:Task')) {
    group.entries.push(entryFactory.selectBox(translate, {
      id: "short",
      label : 'ID Short',
      selectOptions: options,
      modelProperty: "id-short",
      emptyParameter: false
      }));
  }
}

AccessAASProvider.$inject = ['propertiesPanel', 'translate'];

export default {
  __init__: ['accessAASProvider'],
  accessAASProvider: ['type', AccessAASProvider]
};