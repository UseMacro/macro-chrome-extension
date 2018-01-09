import * as Plugins from '../plugin/plugins.ts';

// Async load data for given web page on page load
// Listen to events to render shortcuts library

const URL_PATH = 'https://raw.githubusercontent.com/UseMacro/macro-data/master/configs/'
const FILE_EXT = '.json'

function getCurrentTab(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };
  chrome.tabs.query(queryInfo, (tabs) => {
    callback(tabs[0]);
  });
}

function getCurrentTabUrl(callback) {
  getCurrentTab((tab) => {
    callback(tab.url);
  });
}

function get(key, callback) {
  chrome.storage.sync.get(key, (items) => {
    callback(chrome.runtime.lastError ? null : items[key]);
  });
}

function save(key, value) {
  var items = {};
  items[key] = value;
  chrome.storage.sync.set(items);
}

// Copied function from: https://stackoverflow.com/a/23945027
  //find & remove protocol (http, ftp, etc.) and get hostname
function extractHostname(url) {
  var hostname;
  if (url.indexOf('://') > -1) {
    hostname = url.split('/')[2];
  } else {
    hostname = url.split('/')[0];
  }

  //find & remove port number
  hostname = hostname.split(':')[0];
  //find & remove '?'
  return hostname.split('?')[0];
}

// Copied function from: https://stackoverflow.com/a/23945027
function extractRootDomain(url) {
  var domain = extractHostname(url),
  splitArr = domain.split('.'),
  arrLen = splitArr.length;

  //extracting the root domain here, check if there is a subdomain
  if (arrLen > 2) {
    domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
    //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. '.me.uk')
    if (splitArr[arrLen - 1].length == 2 && splitArr[arrLen - 1].length == 2) {
      //this is using a ccTLD
      domain = splitArr[arrLen - 3] + '.' + domain;
    }
  }
  return domain;
}

function getKey(url) {
  var domain = extractRootDomain(url);
  return URL_PATH.concat(domain, FILE_EXT);
}

function getShortcutData(key, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', key, true);
  xhr.onload = (e) => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var json = JSON.parse(xhr.responseText);
        callback(json);
      } else {
        console.error(xhr.statusText);
      }
    }
  };
  xhr.onerror = (e) => {
    console.error(xhr.statusText);
  };
  xhr.send(null);
}

function mergeData(shortcuts, plugins) {
  var sections = shortcuts.sections;
  for (var i = 0; i < plugins.length; i++) {
    for (var j = 0; j < sections.length; j++) {
      var plugin = plugins[i];
      var section = sections[j];
      var shortcut = {
        name: plugin.name,
        description: plugin.description,
        keys: plugin.keys
      };
      if (plugin.section == section.name) {
        section.shortcuts.push(shortcut);
        break;
      } else if (j == sections.length - 1) {
        sections.push({name: plugin.section, description: '', shortcuts: [shortcut]});
        break;
      }
    }
  }
  return shortcuts;
}

function initPlugins(plugins) {
  data = [];
  plugins.forEach((plugin) => {
    data.push({
      keys: plugin.keys,
      action: plugin.action.toString()
    });
  });
  chrome.tabs.executeScript({ code: 'var plugins = ' + JSON.stringify(data) + ';' }, () => {
    chrome.tabs.executeScript({ file: 'plugins.js' })
  });
}

function initShortcuts(url, callback) {
  var domain = extractRootDomain(url);
  getPlugins(domain, (plugins) => {
    var key = getKey(url);
    getShortcutData(key, (shortcuts) => {
      var data = mergeData(shortcuts, plugins.listShortcuts());
      save(key, data);
    });
    initPlugins(plugins);
  });
}

function togglePopup(data) {
  chrome.tabs.executeScript({ code: 'var data = ' + JSON.stringify(data) + ';' }, () => {
    chrome.tabs.executeScript({ file: 'init.js' })
  });
}

function isEmpty(obj) {
  return obj == null || (Object.keys(obj).length === 0 && obj.constructor === Object)
}

chrome.commands.onCommand.addListener((command) => {
  if (command == 'toggle-popup') {
    getCurrentTabUrl((url) => {
      var key = getKey(url)
        get(key, (data) => {
          if (isEmpty(data)) {
            initShortcuts(url, (data) => {
              togglePopup(data);
            });
          } else {
            togglePopup(data);
          }
        });
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.tabs.executeScript({ file: 'google.js' }, () => {
      chrome.tabs.insertCSS(tabId, { file: 'google.css' }, function() {
        console.log('css inserted');
      });
      chrome.tabs.sendMessage(tabId, { loadShortcuts: true });
    });
  }

  if (changeInfo.hasOwnProperty('url')) {
    initShortcuts(tab.url, null);
  }
});

function getPlugins(domain, callback) {
  let plugin = Plugins[domain];
  if (!plugin) { return; }

  callback(plugin);

  // TODO (Chris): Update to make it generic
  if (domain === 'github.com') {
    callback(getGithubPlugins());
  } else {
    callback([]);
  }
}

function getGithubPlugins() {
  return [
    {
      section: 'Navigation',
      name: 'test plugin',
      description: 'custom plugin for github',
      keys:
      [{
        "windows": ["cmd", "up"],
        "default": ["cmd", "up"],
        "macos": ["cmd", "up"]
      }],
      action: () => {
        alert('Test plugin');
      }
    },
    {
      section: 'Test Section',
      name: 'test plugin',
      description: 'custom plugin for github',
      keys:
      [{
        "windows": ["k"],
        "default": ["k"],
        "macos": ["k"]
      }],
      action: () => {
        alert('New section plugin');
      }
    }
  ];
}

