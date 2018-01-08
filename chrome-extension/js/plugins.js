const shortcutKeyToEventKeyDict = {
  'esc': 'Escape',
  'tab': 'Tab',
  'caps': 'CapsLock',
  'shift': 'Shift',
  'fn': 'Function',
  'ctrl': 'Control',
  'alt': 'Alt',
  'cmd': 'Meta',
  'back': 'Backspace',
  'delete': 'Delete',
  'enter': 'Enter',
  'up': 'ArrowUp',
  'down': 'ArrowDown',
  'left': 'ArrowLeft',
  'right': 'ArrowRight',
  'home': 'Home',
  'end': 'End',
  'pg dn': 'PageDown',
  'pg up': 'PageUp',
}

function initPlugins() {
  var os = getOS();
  plugins.forEach((plugin) => {
    plugin.keys = plugin.keys.map((keys) => {
      if (keys.hasOwnProperty(os)) {
        keys = keys[os];
      } else {
        keys = keys.default;
      }
      return keys.map(shortcutKeyToEventKey);
    });
    plugin.action = eval(plugin.action);
  });

  var map = {};
  onkeydown = onkeyup = function(e){
    map[e.key] = e.type == 'keydown';
    plugins.some((plugin) => {
      return plugin.keys.some((shortcutKeys) => {
        // TODO(chris): Make exact keys need to be pressed to register, currently if a subset of keys are pressed it will register
        if (shortcutKeys.every(key => map[key])) {
          plugin.action();
          // Reset map because on multiple keys pressed with cmd keys, keyup isn't registered
          map = {};
          return true;
        }
      });
    });
  }
}

function shortcutKeyToEventKey(k) {
  if (shortcutKeyToEventKeyDict.hasOwnProperty(k)) {
    return shortcutKeyToEventKeyDict[k];
  } else {
    return k;
  }
}

function getOS() {
  if (navigator.appVersion.indexOf("Win") != -1) return "windows";
  if (navigator.appVersion.indexOf("Mac") != -1) return "macos";
  if (navigator.appVersion.indexOf("X11") != -1) return "unix";
  if (navigator.appVersion.indexOf("Linux") != -1) return "linux";
  return "unknown";
}

initPlugins();
