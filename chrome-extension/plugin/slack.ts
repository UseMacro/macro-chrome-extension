import { Plugin, PluginBuilder } from './pluginbuilder.ts';

let pb = new PluginBuilder();

pb.setPluginName('Slack');
pb.setUrlRegex(/^https:\/\/.+.slack.com/);
pb.setInitialState({});

let plugin = pb.build();
export default plugin;

