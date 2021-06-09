'use strict';

import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import axios from 'axios';

let assetOptions, capOptions;
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
  assetOptions = [];
  capOptions = [];

  propertiesPanel.registerProvider(LOW_PRIORITY, this);

  getAssets.then(([assets, assetsList]) => {

    console.log(assets, assetsList)

    assetsList.forEach((idShort) => {
      assetOptions.push({name: idShort, value: idShort})
    })

    let {caps, capsList} = invertObject(assets, assetsList);

    console.log(caps, capsList)

    capsList.forEach((cap) => {
      capOptions.push({name: cap, value: cap})
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
    let requestUrls = [];
    let ids = [];

    assetsList.forEach((idShort) => {
      let url = assets[idShort]['capabilityAddress'];
      if (url == undefined) return;

      //TODO: try to combine both arrays
      requestUrls.push(axios.get(url))
      ids.push(idShort)
    })

    axios.all(requestUrls)
    .then(axios.spread((...args) => {
      for (let i = 0; i < args.length; i++) {
        assets[ids[i]]['capabilities'] = [];
        for (let j = 0; j < args[i].data.submodelElements[0].value.length; j++) {
          assets[ids[i]]['capabilities'].push(args[i].data.submodelElements[0].value[j].idShort);
        }
      }
      resolve(assets)
    }))
    .catch((err) => {
      reject(err);
    })

  }

  return new Promise(caps);
}

let getProps = function(group, element, translate) {

  // Only return an entry, if the currently selected
  // element is a task event.

  if (is(element, 'bpmn:Task')) {
    let selBox = entryFactory.selectBox(translate, {
      id: "component-id",
      label : 'Component ID',
      selectOptions: assetOptions,
      modelProperty: "component-id",
      emptyParameter: false
      })

    group.entries.push(entryFactory.selectBox(translate, {
      id: "cap",
      label : 'Capability',
      selectOptions: capOptions,
      modelProperty: "capability",
      emptyParameter: false
    }));

    group.entries.push(selBox);

  }
}

let invertObject = function(assets, assetsList){
  let caps = [];
  let capsList = [];

  assetsList.forEach((idShort) => {
    if (assets[idShort].capabilities !== undefined){
      assets[idShort].capabilities.forEach(cap => {
        if (caps[cap] === undefined){
          caps[cap] = []
          capsList.push(cap)
        }
        caps[cap].push(idShort)
      })
    }
  })

  return {caps, capsList};
}

AccessAASProvider.$inject = ['propertiesPanel', 'translate'];

export default {
  __init__: ['accessAASProvider'],
  accessAASProvider: ['type', AccessAASProvider]
};