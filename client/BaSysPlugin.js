'use strict';

var _ = require('lodash');

function BaSysPlugin(eventBus, overlays) {

  eventBus.on('shape.added', function (event) {
    _.defer(function () {
      changeShape(event);
    });
  });

  function changeShape(event) {
    var element = event.element;

    if (!(element.businessObject.$instanceOf('bpmn:FlowNode') || element.businessObject.$instanceOf('bpmn:Participant'))) {
      return;
    }
    _.defer(function () {
      addStyle(element);
    });

  }

  function addStyle(element) {
  
    if (element.businessObject.topic === 'BasysTask') {
      console.log('Add style to element', element);

      overlays.add(element, 'badge', {
        position: {
          top: 6,
          right: 75
        },
        html: '<div class="basys-logo"></div>'
      });

    }

  }
}

BaSysPlugin.$inject = [
  'eventBus', 'overlays'
];

export default {
  __init__: [ 'basys' ],
  basys: [ 'type', BaSysPlugin ]
};