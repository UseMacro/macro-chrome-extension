import { Plugin, PluginBuilder } from './pluginbuilder.ts';

let pb = new PluginBuilder();
pb.registerShortcut('h', 'a', 'a', () => {});
pb.setDomainName('google.com');

let plugin = pb.build();
console.log(plugin.listShortcuts());
console.log(plugin.getShortcut('h'));
