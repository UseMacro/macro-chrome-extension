import { Plugin, PluginBuilder } from './pluginbuilder.ts';

let pb = new PluginBuilder();

pb.setPluginName('Dropbox Paper');
pb.setUrlRegex(/^https:\/\/paper.dropbox.com/);
pb.setInitialState({});

let plugin = pb.build();
export default plugin;
