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
    // will be difficult for shortcuts without plugins because no defined regex
    let domain = extractRootDomain(url);
    return URL_PATH.concat(domain, FILE_EXT);
  }
}

// always calls callback: shortcuts missing from MD should not interrupt flow
// since plugins may exist
function getShortcutData(key, callback) {
  // need dummy placeholder to allow for merging with plugin data
  let dummy = {name: '', sections: [], notFound: true};
  let xhr = new XMLHttpRequest();
  xhr.open('GET', key, true);
  xhr.onload = (e) => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        let json = JSON.parse(xhr.responseText);
        callback(json);
      } else {
        callback(dummy);
      }
    }
  };
  xhr.onerror = (e) => {
    callback(dummy);
  };
  xhr.onloadend = () => {};
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
  if (plugin) {
    tracker.sendEvent('shortcuts', 'plugin-initialized', plugin.default.pluginName);
    // success handler: if got plugins, merge MD shortcuts with plugins, cache & render
    let key = getShortcutsDataPath(url);
    getShortcutData(key, (shortcuts) => {
      let data = mergeData(shortcuts, plugin);
      save(key, data);
      callback(data);
    });
  } else {
    // failure handler: if no plugins, use MD shortcuts, cache & render
    let key = getShortcutsDataPath(url);
    tracker.sendEvent('shortcuts', 'initialized', key);
    getShortcutData(key, (shortcuts) => {
      save(key, shortcuts);
      callback(shortcuts);
    });
  }
}

function initPanel(data, show) {
  if (data.sections.length > 0) {
    let code = 'var data = ' + JSON.stringify(data) + '; var show = ' + show + ';';
    chrome.tabs.executeScript({ code: code }, () => {
      tracker.sendEvent('popup', 'script-executed', data.name);
      chrome.tabs.executeScript({ file: 'createPanel.js' })
    });
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && changeInfo.hasOwnProperty('status') && changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, { handshake: true }, (response) => {
      if (response && response.handshake) { return; }

      let plugin = getPlugin(tab.url);
      if (plugin) {
        loadPanel(tab.url, false);
        let pluginName = plugin.default.pluginName;
        chrome.tabs.executeScript({ file: pluginName + '.js' }, () => {
          chrome.tabs.insertCSS(tabId, { file: pluginName + '.css' }, () => {});
          chrome.tabs.sendMessage(tabId, { loadShortcuts: true });
        });
        setMacroIconAsActive(tabId, true);
      } else {
        initShortcuts(tab.url, (data) => {
          if (data.notFound === true) {
            setMacroIconAsActive(tabId, false);
          } else {
            setMacroIconAsActive(tabId, true);
            loadPanel(tab.url, false);
          }
        });
      }
    });
  }
});

function loadPanel(url, show) {
  let key = getShortcutsDataPath(url);
  get(key, (data) => {
    if (isEmpty(data) || true) {
      initShortcuts(url, (shortcutData) => {
        initPanel(shortcutData, show);
        initOnboardingPopupOnFirstVisit(url, shortcutData);
      });
    } else {
      initPanel(data, show);
    }
  });
}

chrome.browserAction.onClicked.addListener(tab => {
  let key = getShortcutsDataPath(tab.url);
  get(key, (data) => {
    if (data.notFound !== true) {
      loadPanel(tab.url, true);
    }
  });
});

function isEmpty(obj) {
  return obj == null || (Object.keys(obj).length === 0 && obj.constructor === Object)
}

function setMacroIconAsActive(tabId, isActive) {
  if (isActive) {
    chrome.browserAction.setIcon({path: 'img/icon.png', tabId: tabId});
  } else {
    chrome.browserAction.setIcon({path: 'img/icon_inactive.png', tabId: tabId});
  }
}

function initOnboardingPopupOnFirstVisit(url, data) {
  let key = getVisitedKey(url);
  // check chrome storage if user has visited this plugin before
  get(key, (visited) => {
    if (visited == null) {
      save(key, true);
      let plugin = getPlugin(url);
      if (plugin) {
        var name = plugin.default.pluginName;
      } else {
        var name = extractRootDomain(url);
      }

      let code = 'var data = ' + JSON.stringify(data) + ';' + 'var name = "' + name + '";';
      chrome.tabs.executeScript({ code: code }, () => {
        chrome.tabs.executeScript({ file: 'createOnboardingPopup.js' });
      });
    }
  });
}

function getVisitedKey(url) {
  return getShortcutsDataPath(url) + '_visited';
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.logEvent) {
    tracker.sendEvent(request.eventCategory, request.eventAction, request.eventLabel);
  }
});

chrome.tabs.onActivated.addListener(activeInfo => {
  getCurrentTab(tab => {
    let plugin = getPlugin(tab.url);
    if (plugin) {
      setMacroIconAsActive(tab.tabId, true);
    } else {
      let key = getShortcutsDataPath(tab.url);
      getShortcutData(key, (data) => {
        setMacroIconAsActive(tab.tabId, data.notFound !== true);
      });
    }
  });
});

function getPlugin(url) {
  for (let plugin of Plugins) {
    if (plugin.default.urlRegex.test(url)) {
      return plugin;
    }
  }
  return null;
}
