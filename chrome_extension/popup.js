// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let playsong = document.getElementById('playsong');

function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function (tabs) {
    var tab = tabs[0];
    var url = tab.url;
    callback(url);
  });
}

playsong.onclick = function (element) {
  getCurrentTabUrl(function (url) {
    console.log(url)
    // TODO somehow securely add this URL to the queue. We don't want to be able to add it to servers who we aren't currently listening in. 
    // TODO But we also don't want to have to authorize with oauth2 every time a song needs to be added
  });
};