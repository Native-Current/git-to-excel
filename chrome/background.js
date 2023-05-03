import * as Helpers from './includes/helpers.js';

function catchLastError() {
    if (chrome.runtime.lastError) {
        console.log("e: ", chrome.runtime.lastError);
    }
}

function clickIcon() {
    console.log("clicked icon");
    chrome.action.setBadgeText({ text: "MAP" });
    chrome.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
        let url = Helpers.cloneURL({ url: tabs[0].url });
        if(url){
            Helpers.clone({url: url}).then(function(res){
                console.log(res);
                Helpers.download(res,url);
            });
        }
        else {
            console.log("invalid url");
        }
    });
}


chrome.action.onClicked.addListener(clickIcon);
