var shouldClear = false;
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    console.log(msg.request, msg.value);

    if (msg.request == "ping") {  
        sendResponse({ success: true });
        return true;
    }

    if (msg.request == "clear") {
        shouldClear = true;
        clear(); 
        sendResponse({ success: true, request: msg.request });
        return true;
    }

    if (msg.request == "create"){
        var iframe = document.createElement("iframe");
        iframe.src = msg.request.value;
        iframe.width = 300;
        iframe.height = 300;
        //document.body.appendChild(iframe);
        sendResponse({ success: true });
        return true; 
    }

    if (msg.request == "search") {
        search(msg.value).then(function () {
            sendResponse({ success: true});
        });
        return true;
    }
});

window.addEventListener('load', function () {
    if(shouldClear){
        clear();
    }
});

console.log("CS LOADED");
