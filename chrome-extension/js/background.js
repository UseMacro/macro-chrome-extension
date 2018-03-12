// Async load data for given web page on page load
// Listen to events to render shortcuts library
import * as P from '../plugin/plugins.ts';
import * as A from './analytics.js';
let Plugins = P.default;
let tracker = A.default;

const URL_PATH = 'https://raw.githubusercontent.com/UseMacro/macro-data/master/configs/'
const FILE_EXT = '.json'

function getCurrentTab(callback) {
  let queryInfo = {
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
  let items = {};
  items[key] = value;
  chrome.storage.sync.set(items);
}

// Copied function from: https://stackoverflow.com/a/23945027
// find & remove protocol (http, ftp, etc.) and get hostname
function extractHostname(url) {
  let hostname;
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
  let domain = extractHostname(url),
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

  if (domain.startsWith('www.')) {
    domain = domain.substring(4);
  }

  return domain;
}

function getShortcutsDataPath(url) {
  let plugin = getPlugin(url);
  if (plugin) {
    return URL_PATH.concat(plugin.default.pluginName, FILE_EXT);
  } else {
    // TODO: need to deprecate domain matching in favour of regex matching
    let domain = extractRootDomain(url);
    return URL_PATH.concat(domain, FILE_EXT);
  }
}

// always calls callback: shortcuts missing from MD should not interrupt flow
// since plugins may exist
function getShortcutData(key, callback) {
  let dummy = {name: '', sections: []};
  let xhr = new XMLHttpRequest();
  xhr.open('GET', key, true);
  xhr.onload = (e) => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        let json = JSON.parse(xhr.responseText);
        callback(json);
      } else {
        callback(dummy);
        console.error(xhr.statusText);
      }
    }
  };
  xhr.onerror = (e) => {
    callback(dummy);
    console.error(xhr.statusText);
  };
  xhr.send(null);
}

// Adds a plugin section to shortcuts.sections
// only called when plugins were fetched successfully
function mergeData(shortcuts, plugin) {
  if (!shortcuts.name) {
    shortcuts.name = plugin.default.pluginName + ' Shortcuts';
  }
  let pluginSection = {
    name: 'Plugins',
    description: 'Shortcuts from plugins',
    shortcuts: plugin.default.getShortcutsMDS()
  };
  shortcuts.sections.push(pluginSection);
  return shortcuts;
}

function initShortcuts(url, callback) {
  let plugin = getPlugin(url);
  tracker.sendEvent('shortcuts', 'initialized', plugin.default.pluginName);
  if (plugin) {
    // success handler: if got plugins, merge MD shortcuts with plugins, cache & render
    let key = getShortcutsDataPath(url);
    getShortcutData(key, (shortcuts) => {
      let data = mergeData(shortcuts, plugin);
      save(key, data);
      callback(data);
    });
    // initPlugin(plugin);
  } else {
    // failure handler: if no plugins, use MD shortcuts, cache & render
    let key = getShortcutsDataPath(url);
    getShortcutData(key, (shortcuts) => {
      save(key, shortcuts);
      callback(shortcuts);
    });
  }
}

function initPanel(data) {
  if (data.sections.length > 0) {
    chrome.tabs.executeScript({ code: 'var data = ' + JSON.stringify(data) + ';' }, () => {
      tracker.sendEvent('popup', 'script-executed', data.name);
      chrome.tabs.executeScript({ file: 'createPanel.js' })
    });
  }
}

function loadPanel() {
  getCurrentTabUrl((url) => {
    let key = getShortcutsDataPath(url);
    get(key, (data) => {
      if (isEmpty(data) || true) {
        initShortcuts(url, (shortcutData) => {
           initPanel(shortcutData);
        });
      } else {
        initPanel(data);
      }
    });
  });
}

function isEmpty(obj) {
  return obj == null || (Object.keys(obj).length === 0 && obj.constructor === Object)
}

chrome.webNavigation.onCompleted.addListener((details) => {
  // 0 indicates the navigation happens in the tab content window
  // a positive value indicates navigation in a subframe.
  if (details.frameId === 0) {
    let plugin = getPlugin(details.url);
    if (plugin) {
      loadPanel();
      let pluginName = plugin.default.pluginName;
      chrome.tabs.executeScript({ file: pluginName + '.js' }, () => {
        chrome.tabs.insertCSS(details.tabId, { file: pluginName + '.css' }, () => {});
        chrome.tabs.sendMessage(details.tabId, { loadShortcuts: true });
      });
    }
  }
});

// TODO: We need this if we want to render shortcuts for websites that don't have plugins
// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.hasOwnProperty('url')) {
//     initShortcuts(tab.url, () => {});
//   }
// });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.logEvent) {
    tracker.sendEvent(request.eventCategory, request.eventAction, request.eventLabel);
  }
});

function getPlugin(url) {
  for (let plugin of Plugins) {
    if (plugin.default.urlRegex.test(url)) {
      return plugin;
    }
  }
  return null;
}
