'use strict';

var _ = require('lodash');
var elementOverlays = [];

function BaSysPlugin(eventBus, overlays) {

  eventBus.on('shape.added', function (event) {
    _.defer(function () {
      changeShape(event);
    });
  });

  eventBus.on('shape.changed', function (event) {
    _.defer(function () {
      changeShape(event);
    });
  });

  eventBus.on('shape.removed', function (event) {
    var element = event.element;

    _.defer(function () {
      removeShape(element);
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

  function removeShape(element) {
    var elementObject = elementOverlays[element.id];
    for (var overlay in elementObject) {
      overlays.remove(elementObject[overlay]);
    }
    delete elementOverlays[element.id];
  }

  function addStyle(element) {

    if (elementOverlays[element.id] !== undefined && elementOverlays[element.id].length !== 0) {
      for (var overlay in elementOverlays[element.id]) {
        overlays.remove(elementOverlays[element.id][overlay]);
      }
    }

    elementOverlays[element.id] = [];

    if (element.businessObject.topic === 'BasysTask' ||
        element.businessObject.topic === 'ControlComponent' ||
      (typeof element.businessObject.modelerTemplate !== 'undefined' &&
        element.businessObject.modelerTemplate.includes('de.dfki.cos.basys'))
    ) {

      elementOverlays[element.id].push(
        overlays.add(element, 'badge', {
          position: {
            top: 2,
            right: 22
          },
          html: '<div class="basys-logo"></div>'
        })
      );

    }

  }
}

BaSysPlugin.$inject = [
  'eventBus', 'overlays'
];

export default {
  __init__: ['basys'],
  basys: ['type', BaSysPlugin]
};