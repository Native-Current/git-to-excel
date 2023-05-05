import * as Helpers from './includes/helpers.js';

function catchLastError() {
    if (chrome.runtime.lastError) {
        console.log("e: ", chrome.runtime.lastError);
    }
}

function clickIcon() {
    console.log("clicked icon");
    Helpers.authorize().then(function(valid){
        if(valid){
            Helpers.run();    
        }
    });
}
chrome.action.onClicked.addListener(clickIcon);

chrome.runtime.onMessageExternal.addListener(function (message, sender, sendResponse) {
    console.log(message);
    if (message.request === 'connect') {
        console.log("connected to", sender.origin);
        sendResponse({success: true});
        return true;
    }

    if (message.request === 'subscribe') {
        Helpers.subscribe(message.value).then(function(){
            sendResponse({success: true});
        });
        return true;
    }

});

