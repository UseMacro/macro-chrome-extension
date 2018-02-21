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

export class Plugin {
  domain: string;
  shortcuts: any[]; // MDS
  pluginState: any;

  constructor(domain: string, shortcuts: any[], state: any) {
    this.domain = domain;
    this.shortcuts = shortcuts;
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

  listShortcuts() : any[] {
    // Only include name and keys
    return this.shortcuts.map((s) => {
      return {
        name: s.name,
        keys: s.keys
      };
    });
  }

  getShortcut(name: string) : any {
    return this.shortcuts[name];
  }
}

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
  // transforms shortcuts from developer schema (DS) to macro-data schema (MDS)
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
      keys: [{default: keys}], // DS to MDS
      action: action
    }

    this.validateConfig(config)
    this.shortcuts[name] = config;
  }

  setDomainName(domainName: string) : void {
    // TODO: Validate domain name
    this.domain = domainName;
  }

  validateConfig(config: any) : boolean {
    // Structure: {
    //   'keys': [{default: [string]}],
    //   'action': <function Function>
    // }

    // Validate keys
    if (config.keys.constructor !== Array) {
      throw 'Invalid or missing keys';
    } else if (!('default' in config.keys[0])) {
      throw 'Invalid keys object';
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
