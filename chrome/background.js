import * as Helpers from './includes/helpers.js';

function catchLastError() {
    if (chrome.runtime.lastError) {
        console.log("e: ", chrome.runtime.lastError);
    }
}

async function createOffscreen() {
    console.log("checking offscreen");
    if (await chrome.offscreen.hasDocument?.()) return;
    console.log("creating offscreen");
    await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['BLOBS'],
        justification: 'keep service worker running, load options',
    });
}

function clickIcon() {
    console.log("clicked icon");
    Helpers.run();    
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.keepAlive) {
        console.log('keepAlive');
        sendResponse({success: true});
        return true;
    }
});

chrome.runtime.onStartup.addListener(() => {
    console.log("STARTING UP...");
    createOffscreen();
});

createOffscreen();

