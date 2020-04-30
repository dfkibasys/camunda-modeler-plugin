module.exports = function(electronApp, menuState) {
    return [{
      label: 'Open BaSys Website',
      accelerator: 'CommandOrControl+[',
      enabled: function() {
  
        // only enabled for BPMN diagrams
        return menuState.bpmn;
      },
      action: function() {
        var shell = require('electron').shell;
        shell.openExternal('https://www.basys40.de/');
      }
    }];
  };