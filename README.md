# Macro
Shortcuts for the web.

## Plugin System
Macro aims to provide an open-source plugin system to crowdsource custom shortcuts for all popular websites. We've designed Macro's architecture to be as decoupled as possible, making it simple for any developer to start a new plugin, integrate it with Macro, and get it into user's hands.

This is an upcoming feature for Macro. Support for new plugins will be added as Macro scales to support more of the web.

## Local Development 
### Getting Started
`webpack --watch`

## Shortcut configuration file

All shortcut configuration files are stored within a JSON file. The naming
convention for all configuration files is `{domain-name}.json`. For example,
`example.com` is `example.com.json`. This is to ensure that there are no naming
collisions between configuration files.

Learn more here: https://github.com/UseMacro/macro-data
