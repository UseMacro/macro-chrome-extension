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
  shortcuts: any[];
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
          key(s.shortcut.join(', ', (event, handler) => {
            s.action(event, this.pluginState);
          });
        }
      }
    });
  }

  listShortcuts() : any[] {
    // Only include name and shortcut
    return this.shortcuts.map((s) => {
      return {
        name: s.name,
        shortcut: s.shortcut
      };
    });
  }

  getShortcut(name: string) : any {
    return this.shortcuts[name];
  }
}

export class PluginBuilder {
  domain: string;
  shortcuts: any;
  state: any;

  constructor() {
    this.shortcuts = {};
    this.state = {};
  }

  // TODO: Handle scopes from keymaster
  registerShortcut(name: string,
                   shortcut: string | string[],
                   action: Function) : void {
    if (!name) {
      throw 'Must include a name.';
    }

    let config = {
      shortcut,
      action
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
    //   'shortcut': string,
    //   'action': <function Function>
    // }

    // Validate shortcut
    if (typeof config['shortcut'] !== 'string') {
      throw 'Invalid or missing shortcut';
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
    for (let key in this.shortcuts) {
      shortcuts.push({
        name: key,
        shortcut: this.shortcuts[key].shortcut,
        action: this.shortcuts[key].action
      });
    }

    return new Plugin(this.domain, shortcuts, this.state);
  }
}
