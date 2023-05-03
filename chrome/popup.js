document.getElementById('get-title').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, 'get_title', (response) => {
            console.log(response);
        });
    });
});
