import * as key from 'keymaster';

class PluginState {
  state: object;

  constructor(state: object) {
    this.state = state;
  }

  get(key: string) : object {
    if (!key) {
      throw 'Error: must include the key of the state.';
    }
    return this.state[key];
  }

  getFullState() : object {
    return this.state;
  }

  set(key: string, value: object) {
    this.state[key] = value;
  }
}

export class Plugin {
  domain: string;
  shortcuts: object;
  state: object;

  constructor(domain: string, shortcuts: object, state: object) {
    this.domain = domain;
    this.shortcuts = shortcuts;
    this.pluginState = new PluginState(state);

    initAllShortcuts();
  }

  initAllShortcuts() {
    for (let i in this.shortcuts) {
      key(this.shortcuts[i].shortcut, (event, handler) => {
        this.shortcuts[i].action(event, this.pluginState);
      });
    }
  }

  listShortcuts() : string[] {
    return Object.keys(this.shortcuts);
  }

  getShortcut(name: string) : object {
    return this.shortcuts[name];
  }
}

export class PluginBuilder {
  domain: string;
  shortcuts: object;
  state: object;

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

  validateConfig(config: object) : boolean {
    // Structure: {
    //   'shortcut': string,
    //   'action': <function Function>
    // }

    // Validate shortcut
    if (!typeof config['shortcut'] === 'string') {
      throw 'Invalid or missing shortcut';
    }

    // Validate action
    if (typeof config['action'] !== 'function') {
      throw 'Invalid or missing action';
    }

    return true;
  }

  setInitialState(state: object) {
    this.state = state;
  }

  build() : Plugin {
    if (!this.domain) {
      throw 'Domain name is missing';
    }

    if (Object.keys(this.shortcuts).length === 0) {
      throw 'You need at least one shortcut for a plugin.';
    }

    return new Plugin(this.domain, this.shortcuts, this.state);
  }
}
