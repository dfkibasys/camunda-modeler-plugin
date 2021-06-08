'use strict';

import {
  getComments,
  removeComment,
  addComment
} from './util';

let CamundaPropertiesProvider = require('bpmn-js-properties-panel/lib/provider/camunda/CamundaPropertiesProvider');
let cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
import axios from 'axios';

function AccessAASPluginProvider(injector) {
  let camunda = new CamundaPropertiesProvider(...CamundaPropertiesProvider.$inject.map(dependency => injector.get(dependency)));
  let self = this;

  self.getAssets.then(assets => {
    let newHtml = self.generateSelect(assets);

    self.getTabs = function(element) {
      let array = camunda.getTabs(element);
      let generalIndex;
      let generalTab = array.filter(function(item, index) {
        if (item.id == 'general') {
          generalIndex = index;
          return true;
        }
      });
      if (generalTab.length > 0) {
        let newGeneralTab = this.updateGeneralTab(generalTab[0], newHtml);
        array[generalIndex] = newGeneralTab;
      }
      return array;
    };

  }).catch(err => {
    console.error(err)
  })

};

AccessAASPluginProvider.prototype.getAssets = new Promise((resolve, reject) => 
  {
    let assets = [];
    axios.get("http://10.2.10.4:4999/api/v1/registry")
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

AccessAASPluginProvider.prototype.generateSelect = function(assets){
  let html = '<label for="id-short">Id Short</label><select id="id-short" name="assetID" data-value><option value="">';

  for (let i = 0; i < assets.length; i++){
    html += `<option value="${assets[i]}">${assets[i]}</option>`;
  }
  html += '</select>';

  return html;
}

AccessAASPluginProvider.prototype.updateGeneralTab = function(generalTab, newHtml) {
  let paramID = "id-short";

  if (generalTab.groups.length > 0 && generalTab.groups[0].entries.length > 0) {
    generalTab.groups[0].entries.splice(2, 0, {
      html: newHtml,
      id: paramID,
      set: function(element, values){

        //Remove previous comment
        getComments(element).forEach(function(val) {
          if (val[0] == paramID){
            removeComment(element, val);
          }
        })

        //Add new comment
        addComment(element, paramID, values.assetID)

        //Replacing {} with 'values' will add 'assetID' to BPMN 
        //This needs to be defined in camunda namespace via camunda-bpmn-moddle first to avoid warnings
        return cmdHelper.updateBusinessObject(element, element.businessObject, {}); 
      },
      get: function(element, node) {
        let assetID;

        getComments(element).forEach(function(val) {
          if (val[0] == paramID){
            assetID = val[1]
          }
        })

        return {
          assetID: assetID
        }
      }
    });
  }
  return generalTab;

};

AccessAASPluginProvider.$inject = ['injector'];

function AccessAASPlugin() {

};

export default {
  __init__: ['accessAASPlugin'],
  propertiesProvider: ['type', AccessAASPluginProvider],
  accessAASPlugin: ['type', AccessAASPlugin]
};