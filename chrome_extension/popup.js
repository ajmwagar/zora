// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let playsong = document.getElementById('playsong');
let login = document.getElementById('login');
let loginmessage = document.getElementById('loginmessage');
var socket = io.connect('https://dta.dekutree.org:443');
var xhr = new XMLHttpRequest();

// This function can extract URL Parameters from a string
function getUrlVars(url) {
  var vars = {};
  var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    vars[key] = value;
  });
  return vars;
}

chrome.storage.sync.get(['authToken'], function (result) {
  if (result.key == undefined) {
    playsong.classList.add("hidden");
    login.classList.remove("hidden");
    loginmessage.classList.remove("hidden");
  } else {
    playsong.classList.remove("hidden");
    login.classList.add("hidden");
    loginmessage.textContent = result.key;
  }
});

getCurrentTabUrl(function (url) {
  if (url != "https://www.youtube.com") {
    playsong.classList.add("hidden");
  }
})

socket.on('sendToken', function (data) {
  chrome.storage.sync.set({
    authToken: data
  }, function () {
    console.log('Value is set to ' + value);
  });
});

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

// login with discord OAuth
login.onclick = function (element) {
  chrome.tabs.create({
    url: "https://dta.dekutree.org/api/discord/loginchrome"
  });
}

// Play the song on ZoraBOT
playsong.onclick = function (element) {
  getCurrentTabUrl(function (url) {
    console.log(url)
    // TODO somehow securely add this URL to the queue. We don't want to be able to add it to servers who we aren't currently listening in. 
    // TODO But we also don't want to have to authorize with oauth2 every time a song needs to be added

  });
};