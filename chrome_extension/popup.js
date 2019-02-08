// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let playsong = document.getElementById('playsong');
let login = document.getElementById('login');
let logout = document.getElementById('logout');
let loginmessage = document.getElementById('loginmessage');
var socket = io.connect("https://dta.dekutree.org:445", {
  secure: true
});
var token = "";

// This function can extract URL Parameters from a string
function getUrlVars(url) {
  var vars = {};
  var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    vars[key] = value;
  });
  return vars;
}

// check if the auth token exists in storage
chrome.storage.sync.get(['authToken'], function (result) {
  if (result.authToken == undefined) {
    playsong.classList.add("hidden");
    login.classList.remove("hidden");
    logout.classList.add("hidden");
    loginmessage.classList.remove("hidden");
  } else {
    // check if page is a youtube video
    getCurrentTabUrl(function (url) {
      if (url.slice(0, 29) != "https://www.youtube.com/watch") {
        playsong.classList.add("hidden");
        login.classList.add("hidden");
        logout.classList.remove("hidden");
        loginmessage.textContent = "Please open a YouTube video before activating";
      } else {
        playsong.classList.remove("hidden");
        logout.classList.remove("hidden");
        login.classList.add("hidden");
        fetch('https://discordapp.com/api/users/@me', {
            method: 'get',
            headers: new Headers({
              'Authorization': `Bearer ${result.authToken}`,
              'user-agent': 'DiscordBot (https://github.com/ajmwagar/zora, 0.1)'
            })
          })
          .then(
            function (response) {
              if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' +
                  response.status);
                return;
              }
              response.json().then(function (data) {
                loginmessage.innerHTML = `Welcome to ZoraBOT, <b>${data.username}</b> --- ID: <b>${data.id}</b>\n Current Video URL: <b>${url}</b>`;
              });
            }
          )
          .catch(function (err) {
            console.log('Fetch Error :-S', err);
          });
        token = result.authToken;
      }
    })
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

// log out of discord
logout.onclick = function (element) {
  chrome.storage.sync.remove(['authToken'], function (result) {});
  window.location.href = "popup.html";
}

// Play the song on ZoraBOT
playsong.onclick = function (element) {
  getCurrentTabUrl(function (url) {
    console.log(url)
    socket.emit('playVideo', token, url);
  });
};