import * as Google from './google.ts';
import * as Messenger from './messenger.ts';
import * as Youtube from './youtube.ts';
import { Plugin } from './pluginbuilder.ts';

let plugins = [Google, Messenger, Youtube];
let domainToPlugin = {};
// @ts-ignore
let pluginNameSet = new Set([]);

// Build map of domain to plugin while validating unique domain and plugin names
for (let plugin of plugins) {
  let pluginName = plugin.default.pluginName
  if (pluginNameSet.has(pluginName)) {
    throw 'Plugin with this name already exists: ' + pluginName;
  }
  pluginNameSet.add(pluginName);

  for (let domain of plugin.default.domains) {
    if (domainToPlugin.hasOwnProperty(domain)) {
      throw 'This domain has already been defined: ' + domain;
    }
    domainToPlugin[domain] = plugin;
  }
}

export default domainToPlugin;
