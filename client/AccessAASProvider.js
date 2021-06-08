'use strict';

import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import axios from 'axios';

let options;
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
  options = [];

  propertiesPanel.registerProvider(LOW_PRIORITY, this);

  getAssets.then(([assets, assetsList]) => {

    console.log(assets, assetsList)

    assetsList.forEach((idShort) => {
      options.push({name: idShort, value: idShort})
    })

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
    let assets = {};
    let assetsList = [];

    axios.get("http://10.2.10.4:4000/api/v1/registry")
    .then(res => {
      for (let i = 0; i < res.data.length; i++) {
        let idShort = res.data[i].asset.idShort;
        assets[idShort] = { idShort };

        //submodel loop
        for (let j = 0; j < res.data[i].submodels.length; j++) {
            if (res.data[i].submodels[j].idShort === "Capabilities"){
              let capabilityAddress = res.data[i].submodels[j].endpoints[0].address;
              capabilityAddress = capabilityAddress.replace(/localhost/i, "10.2.10.4") // temporary fix
              assets[idShort]['capabilityAddress'] = capabilityAddress;
            }
        }

        assetsList.push(idShort);

      }
      getCapabilities(assetsList, assets).then((assets) => {
        resolve([assets, assetsList]);
      })    
      .catch(err => {
        reject(err);
      })

    })
    .catch(err => {
      reject(err);
    })
  });

let getCapabilities = function(assetsList, assets){

  const caps = function(resolve, reject) {
    assetsList.forEach((idShort) => {
      
      let url = assets[idShort]['capabilityAddress'];
      if (url == undefined) return;

      axios.get(url)
      .then(res => {
        assets[idShort]['capabilities'] = [];
        for (let i = 0; i < res.data.submodelElements[0].value.length; i++) {
          assets[idShort]['capabilities'].push(res.data.submodelElements[0].value[i].idShort);
        }
        resolve(assets)
      })
      .catch((err) => {
        reject(err);
      })
    })
  }

  return new Promise(caps);
}

let getProps = function(group, element, translate) {

  // Only return an entry, if the currently selected
  // element is a task event.

  if (is(element, 'bpmn:Task')) {
    group.entries.push(entryFactory.selectBox(translate, {
      id: "short",
      label : 'Component ID',
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