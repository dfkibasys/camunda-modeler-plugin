'use strict';

let CamundaPropertiesProvider = require('bpmn-js-properties-panel/lib/provider/camunda/CamundaPropertiesProvider');
import axios from 'axios';

function AccessAASPluginProvider(eventBus, canvas, bpmnFactory, elementRegistry, elementTemplates, translate) {
  let camunda = new CamundaPropertiesProvider(eventBus, canvas, bpmnFactory, elementRegistry, elementTemplates, translate);
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

  })

};

AccessAASPluginProvider.prototype.getAssets = new Promise(function(resolve, reject) {
  let assets = [];
  axios.get("http://127.0.0.1:4999/api/v1/registry").then((res) => {
    for (let i = 0; i < res.data.length; i++) {
      assets.push(res.data[i].asset.idShort);
    }
  }).catch(err => {
    reject(assets);
  })
  .finally(() => {
   resolve(assets);
  })
});

AccessAASPluginProvider.prototype.generateSelect = function(assets){
  let html = '<label for="own-select">Id Short</label><select id="id-short" data-action="selectOption"><option value="">';

  for (let i = 0; i < assets.length; i++){
    html += `<option value="idShort.${assets[i]}">${assets[i]}</option>`;
  }
  html += '</select>';

  return html;
}

AccessAASPluginProvider.prototype.updateGeneralTab = function(generalTab, newHtml) {

  if (generalTab.groups.length > 0 && generalTab.groups[0].entries.length > 0) {
    generalTab.groups[0].entries.splice(2, 0, {
      html: newHtml,
      id: "id-short-select",
      selectOption: function(element, node) {
        console.log(element);
      }
    });
  }
  return generalTab;

};

AccessAASPluginProvider.$inject = ['eventBus', 'canvas', 'bpmnFactory', 'elementRegistry', 'elementTemplates', 'translate'];

function AccessAASPlugin() {

};

export default {
  __init__: ['accessAASPlugin'],
  propertiesProvider: ['type', AccessAASPluginProvider],
  accessAASPlugin: ['type', AccessAASPlugin]
};