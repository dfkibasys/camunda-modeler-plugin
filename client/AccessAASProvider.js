'use strict';

import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import axios from 'axios';
let cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

let assetOptions, capOptions;
let capabilities;
let basys_compatibility = null;

const LOW_PRIORITY = 500;

let aas_server_url = "http://localhost:4000/api/v1/registry"

function AccessAASProvider(propertiesPanel, translate) {
  assetOptions = [];
  capOptions = [];

  propertiesPanel.registerProvider(LOW_PRIORITY, this);

  this.getTabs = function(element) {
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

  requestServerData();

};

// Create the custom Basys tab.
// The properties are organized in groups.
let createBasysTabGroups = (element, translate) => {

  // Create a group called "Config".
  var configGroup = {
    id: 'config',
    label: 'Config',
    entries: []
  };

  // Create a group called "Component".
  var componentGroup = {
    id: 'component',
    label: 'Component',
    entries: []
  };

  // Add the props to all of the groups
  getConfigProps(configGroup, element, translate);
  getComponentProps(componentGroup, element, translate);

  return [
    configGroup,
    componentGroup
  ];
}

let requestServerData = () => {

  getAssets().then(([assets, assetsList]) => {

    assetsList.forEach((idShort) => {
      assetOptions.push({name: idShort, value: idShort})
    })

    let {caps, capsList} = invertObject(assets, assetsList);

    capabilities = caps;

    capsList.forEach((cap) => {
      capOptions.push({name: cap, value: cap})
    })

  }).catch(err => {
    console.error(err)
  })
}

let getAssets = () => {
  const request = function(resolve, reject) {

    let assets = {};
    let assetsList = [];

    axios.get(aas_server_url)
    .then(res => {
      for (let i = 0; i < res.data.length; i++) {
        let idShort = res.data[i].asset.idShort;
        assets[idShort] = { idShort };

        //submodel loop
        for (let j = 0; j < res.data[i].submodels.length; j++) {
            if (res.data[i].submodels[j].idShort === "Capabilities"){
              let capabilityAddress = res.data[i].submodels[j].endpoints[0].address;
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

  }

  return new Promise(request);
}

let getCapabilities = (assetsList, assets) => {

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

let getComponentProps = (group, element, translate) => {

  // Only return an entry, if the currently selected
  // element is a task event.

  if (is(element, 'bpmn:ServiceTask')) {

    group.entries.push(entryFactory.selectBox(translate, {
      id: "cap",
      label : 'Capability',
      selectOptions: capOptions,
      modelProperty: "capability",
      emptyParameter: false,
      set: function(element, values){
        //data will be read when reselecting the task
        assetOptions = []
        capabilities[values.capability].forEach((componentId) => {
          assetOptions.push({name: componentId, value: componentId})
        })

        //hack to trigger a task reselect
        document.getElementsByClassName("bpmn-icon-subprocess-expanded")[0].click()
        
        return cmdHelper.updateBusinessObject(element, element.businessObject, {'name': values.capability, 'capability': values.capability})
      }
    }));

    group.entries.push(entryFactory.selectBox(translate, {
      id: "component-id",
      label : 'Component ID',
      selectOptions: assetOptions,
      modelProperty: "component-id",
      emptyParameter: false,
    }));

    group.entries.push({
      html: "<button id='feasability-button' data-action='checkFeasability'>Check feasability</button>",
      id: "form-fields-feasability-button",
      checkFeasability: function(element, node) {
        node.childNodes[0].style.backgroundColor = "#bada55"

        setTimeout(function(){  
          node.childNodes[0].style.backgroundColor = "#efefef" 
        }, 2000);
      }
    });

  }
}

let getConfigProps = (group, element, translate) => {

    group.entries.push(entryFactory.textField(translate, {
      id: "url",
      description: "Enter AAS server url.",
      label : 'AAS Server',
      modelProperty: "url",
      get: function(element, node) {
          return { url: aas_server_url };
      },
      set: function(element, values){
        aas_server_url = values.url
      }
    }));

    group.entries.push({
      html: "<button id='request-button' data-action='requestData'>Request data</button>",
      id: "form-fields-request-button",
      requestData: function(element, node) {
        console.log("Request AAS server data")
        requestServerData()
      }
    });

    if (is(element, 'bpmn:ServiceTask')) {

      group.entries.push(entryFactory.toggleSwitch(translate, {
        id: "toggle-switch",
        label: "Basys compatibility",
        modelProperty: 'isActive',
        descriptionOn: 'Properties have been added',
        descriptionOff: 'Properties need to be added',
        labelOn: "Active",
        labelOff: "Inactive",
        isOn: function(){
        return basys_compatibility;
        },
        get: function(element) {
          let topic = element.businessObject.get('camunda:topic');
          basys_compatibility = (topic !== undefined && topic === "ControlComponent");
          return {'isActive': basys_compatibility};
        },
        set: function(element, values, node) {
          return cmdHelper.updateBusinessObject(element, element.businessObject, {'camunda:topic': 'ControlComponent', 'camunda:type': "external"})
        }
      }));

    }
 
}

let invertObject = (assets, assetsList) => {
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