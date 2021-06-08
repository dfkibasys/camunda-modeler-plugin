import {
    registerBpmnJSPlugin,
    registerBpmnJSModdleExtension
  } from 'camunda-modeler-plugin-helpers';

import BaSysPlugin from './BaSysPlugin';
import accessAASProviderModule from './AccessAASProvider';
import basysModdleDescriptor from './descriptors/basys';

registerBpmnJSPlugin(BaSysPlugin);
registerBpmnJSPlugin(accessAASProviderModule);

registerBpmnJSModdleExtension(basysModdleDescriptor);

