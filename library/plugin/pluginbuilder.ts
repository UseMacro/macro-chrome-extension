export class Plugin {
  domain: string;
  shortcuts: object;

  constructor(domain: string, shortcuts: object) {
    this.domain = domain;
    this.shortcuts = shortcuts;
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

  constructor() {
    this.shortcuts = {};
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

  build() : Plugin {
    if (!this.domain) {
      throw 'Domain name is missing';
    }

    if (Object.keys(this.shortcuts).length === 0) {
      throw 'You need at least one shortcut for a plugin.';
    }

    return new Plugin(this.domain, this.shortcuts);
  }
}
