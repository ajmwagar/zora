// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let playsong = document.getElementById('playsong');
let login = document.getElementById('login');
let loginmessage = document.getElementById('loginmessage');
var xhr = new XMLHttpRequest();
var socket = io.connect("https://dta.dekutree.org:443");
var token = "";

// This function can extract URL Parameters from a string
function getUrlVars(url) {
  var vars = {};
  var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    vars[key] = value;
  });
  return vars;
}

getCurrentTabUrl(function (url) {
  if (url.slice(0, 29) != "https://www.youtube.com/watch") {
    playsong.classList.add("hidden");
    loginmessage.textContent = "Please open a YouTube video before activating";
  } else {
    playsong.classList.remove("hidden");
  }
})

chrome.storage.sync.get(['authToken'], function (result) {
  if (result.authToken == undefined) {
    playsong.classList.add("hidden");
    login.classList.remove("hidden");
    loginmessage.classList.remove("hidden");
  } else {
    playsong.classList.remove("hidden");
    login.classList.add("hidden");
    loginmessage.textContent = "Your personal auth token is: " + result.authToken;
    token = result.authToken;
  }
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
    socket.emit('playVideo', token, url);
  });
};