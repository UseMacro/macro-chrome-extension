// Validates shortcut JSON config
// More details found here: https://paper.dropbox.com/doc/JSON-Data-Format-XaQ21RmPGZS778W2LKza2

const SUPPORTED_OS = ['default', 'windows', 'macos', 'linux', 'ubuntu'];
const ALPHABET_KEYS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
                       'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const NUMBER_KEYS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const SPECIAL_KEYS = ['`', 'esc', 'tab', 'caps', 'shift', 'fn', 'ctrl', 'alt', 'cmd', '-', '=', 'back', 'delete',
                      'enter', '[', ']', '\\', ';', "'", ',', '.', '/', 'up', 'down', 'left', 'right', 'insert',
                      'home', 'end', 'pg dn', 'pg up', 'win'];
const SUPPORTED_KEYS = ALPHABET_KEYS.concat(NUMBER_KEYS, SPECIAL_KEYS);

function validate(data) {
  try {
    validateConfig(data);
    return {status: 'success'};
  } catch (err) {
    return {status: 'error', error: err};
  }
}

function validateConfig(config) {
  numKeys = Object.keys(config).length;
  if (numKeys > 3) throw 'more than 3 keys in config';
  if (numKeys == 3) validateStringProp(config, 'description');
  validateStringProp(config, 'name');
  validateArrayProp(config, 'sections');
  validateSections(config.sections);
}

function validateSections(sections) {
  if (sections.length == 0) {
    return;
  }
  section = sections[0];
  numKeys = Object.keys(section).length;
  if (numKeys > 3) throw 'more than 3 keys in section';
  if (numKeys == 3) validateStringProp(section, 'description');
  validateStringProp(section, 'name');
  validateArrayProp(section, 'shortcuts');
  validateShortcuts(section.shortcuts);
  validateSections(sections.slice(1, sections.length));
}

function validateShortcuts(shortcuts) {
  if (shortcuts.length == 0) {
    return;
  }
  shortcut = shortcuts[0];
  numKeys = Object.keys(shortcut).length;
  if (numKeys > 3) throw 'more than 3 keys in shortcut';
  if (numKeys == 3) validateStringProp(shortcut, 'description');
  validateStringProp(shortcut, 'name');
  validateArrayProp(shortcut, 'keys');
  validateKeys(shortcut.keys);
  validateShortcuts(shortcuts.slice(1, shortcuts.length));
}

function validateKeys(keys) {
  if (keys.length == 0) {
    return;
  }
  key = keys[0];
  validateOSProp(key, 'default');
  for (var os in key) {
    if (SUPPORTED_OS.indexOf(os) > -1) validateOSProp(key, os);
    else throw 'unsupported os: ' + os + 'in object: ' + JSON.stringify(key);
  }
  validateKeys(keys.slice(1, keys.length));
}

// Helper functions

function validateArrayProp(obj, prop) {
  if (!obj.hasOwnProperty(prop)) throw 'missing prop: ' + prop + ' in object: ' + JSON.stringify(obj);
  if (!(obj[prop] instanceof Array)) throw 'expected array for prop: ' + prop + ' in object: ' + JSON.stringify(obj);
  if (obj[prop].length == 0) throw 'array size == 0 for prop: ' + prop + ' in object: ' + JSON.stringify(obj);
}

function validateStringProp(obj, prop) {
  if (!obj.hasOwnProperty(prop)) throw 'missing prop: ' + prop + ' in object: ' + JSON.stringify(obj);
  if (!isValidString(obj[prop])) throw 'invalid string for prop: ' + prop + ' in object: ' + JSON.stringify(obj);
}

function isValidString(x) {
  return typeof x == 'string' && x == x.toLowerCase();
}

function validateOSProp(obj, prop) {
  if (!obj.hasOwnProperty(prop)) throw 'missing prop: ' + prop + ' in object: ' + JSON.stringify(obj);
  if (!(obj[prop] instanceof Array)) throw 'expected type array for prop: ' + prop + ' in object: ' + JSON.stringify(obj);
  for (var i = 0; i < obj[prop].length; i++) {
    var key = obj[prop][i];
    if (!isValidString(key)) throw 'invalid string: ' + key + ' for os: ' + prop + ' in object: ' + JSON.stringify(obj);
    if (SUPPORTED_KEYS.indexOf(key) == -1) throw 'unsupported key: ' + key + ' for os: ' + prop + ' in object: ' + JSON.stringify(obj);
  }
}

