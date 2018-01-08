import { Plugin, PluginBuilder } from './pluginbuilder.ts';

let pb = new PluginBuilder();
pb.registerShortcut('h', 'a', () => {});
pb.setDomainName('google.com');

let plugin = pb.build();
console.log(plugin.listShortcuts());
console.log(plugin.getShortcut('h'));

console.log(plugin.getFullState());
plugin.setState('hello', 'world');
console.log(plugin.getFullState());
console.log(plugin.getState('hello'));
