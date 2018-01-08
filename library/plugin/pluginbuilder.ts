export class Plugin {
  domain: string;
  shortcuts: object;
  state: object;

  constructor(domain: string, shortcuts: object, state: object) {
    this.domain = domain;
    this.shortcuts = shortcuts;
    this.state = state;
  }

  listShortcuts() : string[] {
    return Object.keys(this.shortcuts);
  }

  getShortcut(name: string) : object {
    return this.shortcuts[name];
  }

  getState(key: string) : object{
    if (!key) {
      throw 'Error: must include the key of the state.';
    }
    return this.state[key];
  }

  getFullState() : object {
    return this.state;
  }

  setState(key: string, value: object) {
    this.state[key] = value;
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

  // TODO: What's better design, giving a config object or passing in multiple
  // objects?
  registerShortcut(name: string,
                   shortcut: string | string[],
                   description: string,
                   action: Function) : void {
    if (!name) {
      throw 'Must include a name.';
    }

    let config = {
      shortcut,
      description,
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
    //   'shortcut': string | string[],
    //   'description': 'Description of the shortcut.',
    //   'action': <function Function>
    // }

    // Validate shortcut
    if (!(config['shortcut'].constructor === Array ||
         typeof config['shortcut'] === 'string')) {
      throw 'Invalid or missing shortcut';
    }

    // Validate description
    if (typeof config['description'] !== 'string') {
      throw 'Invalid or missing description';
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
