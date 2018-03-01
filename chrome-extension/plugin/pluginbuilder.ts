import * as key from 'keymaster';

const DOMAIN_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;

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

// Plugin manages a set of keyboard shortcuts for a set of domain
// Note: stores shortcuts in DS
export class Plugin {
  pluginName: string; // Should be the same as the filename
  domains: string[];
  shortcuts: any[]; // DS
  pluginState: any;

  constructor(pluginName: string, domains: string[], shortcuts: any[], state: any) {
    this.pluginName = pluginName;
    this.domains = domains;
    this.shortcuts = shortcuts; // DS
    this.pluginState = new PluginState(state);
    this.init();
  }

  init() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.loadShortcuts) {
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
    return this.shortcuts.map(s => {
      let MDS = s.keys.map(key => { return {default: [key]}; });
      return {
        name: s.name,
        keys: MDS
      };
    });
  }

  listShortcuts() : any[] {
    // Only include name and keys
    return this.shortcuts.map((s) => {
      return {
        name: s.name,
        keys: s.keys
      };
    });
  }

  // getShortcut(name: string) : any {
  //   return this.shortcuts[name];
  // }
}

// Provides an API for third party developers to create customs plugins for a set of domains
// Note: PluginBuilder only handles shortcuts defined in developer schema (DS)
export class PluginBuilder {
  pluginName: string;
  domains: string[];
  // PluginBuilder requires shortcuts to be in DS
  shortcuts: any;
  state: any;

  constructor() {
    this.shortcuts = {};
    this.state = {};
    this.domains = [];
  }

  // TODO: Handle scopes from keymaster
  registerShortcut(name: string,
                   keys: string | string[],
                   action: Function) : void {
    if (!name) {
      throw 'Must include a name.';
    }

    if (typeof keys === 'string') {
      keys = [keys];
    }

    let config = {
      keys: keys,
      action: action
    }

    this.validateConfig(config);
    this.shortcuts[name] = config;
  }

  setPluginName(pluginName: string) : void {
    this.pluginName = pluginName;
  }

  addDomainName(domainName: string) : void {
    if (!DOMAIN_REGEX.test(domainName)) {
      throw 'Not a valid domain';
    }
    this.domains.push(domainName);
  }

  validateConfig(config: any) : boolean {
    // Structure: {
    //   'keys': string[],
    //   'action': <function Function>
    // }

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

    if (this.domains.length === 0) {
      throw 'Domain name is missing for plugin: ' + this.pluginName;
    }

    if (Object.keys(this.shortcuts).length === 0) {
      throw 'You need at least one shortcut for a plugin.';
    }

    let shortcuts = [];
    for (let name in this.shortcuts) {
      shortcuts.push({
        name: name,
        keys: this.shortcuts[name].keys,
        action: this.shortcuts[name].action
      });
    }

    return new Plugin(this.pluginName, this.domains, shortcuts, this.state);
  }
}
