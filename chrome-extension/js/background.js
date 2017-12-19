// Async load data for given web page on page load
// Listen to events to render shortcuts library

const URL_PATH = 'https://raw.githubusercontent.com/chrisjluc/macro-data/master/'
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
  getCurrentTab((tab) => {
    _get(!tab.incognito, key, callback);
  });
}

function _get(isPersisted, key, callback) {
  if (isPersisted) {
    chrome.storage.sync.get(key, (items) => {
      callback(chrome.runtime.lastError ? null : items[key]);
    });
  } else {
    chrome.runtime.getBackgroundPage((bgPage) => {
      callback(bgPage.hasOwnProperty(key) ? bgPage[key] : null);
    });
  }
}

function save(key, value) {
  getCurrentTab((tab) => {
    _save(!tab.incognito, key, value);
  });
}

function _save(shouldPersist, key, value) {
  if (shouldPersist) {
    var items = {};
    items[key] = value;
    chrome.storage.sync.set(items);
  } else {
    chrome.runtime.getBackgroundPage((bgPage) => {
      bgPage[key] = data;
    });
  }
}

// Copied function from: https://stackoverflow.com/a/23945027
function extractHostname(url) {
  var hostname;
  //find & remove protocol (http, ftp, etc.) and get hostname

  if (url.indexOf('://') > -1) {
    hostname = url.split('/')[2];
  } else {
    hostname = url.split('/')[0];
  }

  //find & remove port number
  hostname = hostname.split(':')[0];
  //find & remove '?'
  hostname = hostname.split('?')[0];

  return hostname;
}

// Copied function from: https://stackoverflow.com/a/23945027
function extractRootDomain(url) {
  var domain = extractHostname(url),
  splitArr = domain.split('.'),
  arrLen = splitArr.length;

  //extracting the root domain here
  //if there is a subdomain
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

function saveData(url, callback) {
  var xhr = new XMLHttpRequest();
  var key = getKey(url);
  xhr.open('GET', key, true);
  xhr.onload = function (e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        save(key, xhr.responseText);
        if (callback != null) {
          callback(xhr.responseText);
        }
      } else {
        console.error(xhr.statusText);
      }
    }
  };
  xhr.onerror = function (e) {
    console.error(xhr.statusText);
  };
  xhr.send(null);
}

function togglePopup(data) {
  // TODO: Render or close popup
  console.log(data);
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
            saveData(url, (data) => {
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
  if (changeInfo.hasOwnProperty('url')) {
    saveData(tab.url, null);
  }
});

