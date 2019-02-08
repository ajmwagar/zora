// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
  chrome.declarativeContent.onPageChanged.addRules([{
    conditions: [new chrome.declarativeContent.PageStateMatcher({})],
    actions: [new chrome.declarativeContent.ShowPageAction()]
  }]);
});

// This function can extract URL Parameters from a string
function getUrlVars(url) {
  var vars = {};
  var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    vars[key] = value;
  });
  return vars;
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // read changeInfo data and do something with it (like read the url)
  if (changeInfo.url) {
    if (changeInfo.url.slice(0, 12) == "https://zora") {
      console.log(changeInfo.url);
      var vars = {};
      var parts = changeInfo.url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        chrome.storage.sync.set({
          authToken: value
        }, function () {
          console.log('Token is set to ' + value);
        });
      });

    }
  }
});