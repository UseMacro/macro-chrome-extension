import { Plugin, PluginBuilder } from './pluginbuilder.ts';

let pb = new PluginBuilder();

pb.setPluginName('Gmail');
pb.setUrlRegex(/^https:\/\/mail.google.com/);
pb.setInitialState({});

let plugin = pb.build();
export default plugin;
