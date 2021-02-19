import {
    registerBpmnJSPlugin
  } from 'camunda-modeler-plugin-helpers';

import BaSysPlugin from './BaSysPlugin';
import AccessAASPluginProvider from './AccessAASPluginProvider';
  
registerBpmnJSPlugin(BaSysPlugin);
registerBpmnJSPlugin(AccessAASPluginProvider);