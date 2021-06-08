import {
    registerBpmnJSPlugin
  } from 'camunda-modeler-plugin-helpers';

import BaSysPlugin from './BaSysPlugin';
import accessAASProviderModule from './AccessAASProvider';
  
registerBpmnJSPlugin(BaSysPlugin);
registerBpmnJSPlugin(accessAASProviderModule);