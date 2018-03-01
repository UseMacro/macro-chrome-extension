import * as Google from './google.ts';
import * as GoogleImages from './google-images.ts';
import * as Messenger from './messenger.ts';

let plugins = [Google, Messenger, GoogleImages];
// @ts-ignore
let pluginNameSet = new Set([]);

for (let plugin of plugins) {
  let pluginName = plugin.default.pluginName
  if (pluginNameSet.has(pluginName)) {
    throw 'Plugin with this name already exists: ' + pluginName;
  }
  pluginNameSet.add(pluginName);
}

export default plugins;

