setInterval(() => {
    chrome.runtime.sendMessage({ keepAlive: true });
}, 20000);