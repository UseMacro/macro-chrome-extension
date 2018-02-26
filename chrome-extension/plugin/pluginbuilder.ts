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

// Plugin manages a set of keyboard shortcuts for a domain
// Note: stores shortcuts in DS
export class Plugin {
  domain: string;
  shortcuts: any[]; // DS
  pluginState: any;

  constructor(domain: string, shortcuts: any[], state: any) {
    this.domain = domain;
    this.shortcuts = shortcuts; // DS
    this.pluginState = new PluginState(state);
    this.init();
  }

  init() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.loadShortcuts) {
        for (let s of this.shortcuts) {
          key(s.keys.join(', '), (event, handler) => {
            s.action(event, this.pluginState);
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

// Provides an API for third party developers to create customs plugins for a domain
// Note: PluginBuilder only handles shortcuts defined in developer schema (DS)
export class PluginBuilder {
  domain: string;
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

  setDomainName(domainName: string) : void {
    // TODO: Validate domain name
    this.domain = domainName;
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
    if (!this.domain) {
      throw 'Domain name is missing';
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

    return new Plugin(this.domain, shortcuts, this.state);
  }
}
