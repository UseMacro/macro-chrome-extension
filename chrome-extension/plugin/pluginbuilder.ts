import * as key from 'keymaster';

class PluginState {
  state: any;

  constructor(state: any) {
    for (let key in state) {
      this[key] = state[key]
    }
  }

  getFullState() : any {
    return this;
  }

  set(obj: any) {
    for (let key in obj) {
      this[key] = obj[key];
    }
  }
}

// Plugin manages a set of keyboard shortcuts for a url that matches the regex
// Note: stores shortcuts in DS
export class Plugin {
  pluginName: string; // Should be the same as the filename
  urlRegex: any;
  shortcuts: any[]; // DS
  pluginState: any;

  constructor(pluginName: string, urlRegex: any, shortcuts: any[], state: any) {
    this.pluginName = pluginName;
    this.urlRegex = urlRegex;
    this.shortcuts = shortcuts; // DS
    this.pluginState = new PluginState(state);
    this.init();
  }

  init() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.handshake) {
        sendResponse({ handshake: true });
      } else if (request.loadShortcuts) {
        key.filter = (event) => true;
        for (let s of this.shortcuts) {
          key(s.keys.join(', '), (event, handler) => {
            s.action(event, this.pluginState);
            chrome.runtime.sendMessage({
              logEvent: true,
              eventCategory: 'shortcut-triggered',
              eventAction: this.pluginName,
              eventLabel: s.keys.join(', ')
            });
          });
        }
      }
    });
  }

  // MDS getter for frontend
  // returns a list of shortcut objects in MDS
  getShortcutsMDS() : object[] {
    return this.shortcuts.filter((s) => {
      return s.showInPanel;
    }).map((s) => {
      // clone shortcut to not affect the underlying data
      let shortcut = JSON.parse(JSON.stringify(s));
      delete shortcut.showInPanel;
      shortcut.keys = s.keys.map(key => { return {default: [key]}; });
      return shortcut;
    });
  }

  getFileName() : string {
    return this.pluginName.replace(' ', '-').toLowerCase();
  }
}

// Provides an API for third party developers to create customs plugins for a url that matches our regex
// Note: PluginBuilder only handles shortcuts defined in developer schema (DS)
export class PluginBuilder {
  pluginName: string;
  urlRegex: any;
  // PluginBuilder requires shortcuts to be in DS
  shortcuts: any;
  state: any;

  constructor() {
    this.shortcuts = {};
    this.state = {};
  }

  // TODO: Handle scopes from keymaster
  registerShortcut(name: string,
                   keys: string | string[],
                   action: Function,
                   options?: any) : void {
    if (!name) {
      throw 'Must include a name.';
    }

    if (typeof keys === 'string') {
      keys = [keys];
    }

    let config = {
      keys: keys,
      action: action,
      showInPanel: true
    }

    if (options && !options.showInPanel) {
      config.showInPanel = false;
    }

    this.validateConfig(config);
    this.shortcuts[name] = config;
  }

  setPluginName(pluginName: string) : void {
    this.pluginName = pluginName;
  }

  setUrlRegex(urlRegex: any) : void {
    this.urlRegex = urlRegex;
  }

  validateConfig(config: any) : boolean {

    // Validate keys
    if (config.keys.constructor !== Array) {
      throw 'Invalid or missing keys';
    }

    // Validate action
    if (typeof config['action'] !== 'function') {
      throw 'Invalid or missing action';
    }

    return true;
  }

  setInitialState(state: any) {
    this.state = state;
  }

  build() : Plugin {
    if (!this.pluginName) {
      throw 'Plugin name is missing'
    }

    if (!this.urlRegex) {
      throw 'URL regex is missing'
    }

    if (Object.keys(this.shortcuts).length === 0) {
      throw 'You need at least one shortcut for a plugin.';
    }

    let shortcuts = [];
    for (let name in this.shortcuts) {
      shortcuts.push({
        name: name,
        keys: this.shortcuts[name].keys,
        action: this.shortcuts[name].action,
        showInPanel: this.shortcuts[name].showInPanel
      });
    }

    return new Plugin(this.pluginName, this.urlRegex, shortcuts, this.state);
  }
}
