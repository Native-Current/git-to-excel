function clear(){
    document.body.innerHTML = null;
}

function targetElement(element) {
    return (
        element.tagName !== "IFRAME" &&
        element.tagName !== "SCRIPT" &&
        element.tagName !== "NOSCRIPT" &&
        element.tagName !== "TEXTAREA" &&
        element.tagName !== "INPUT" &&
        element.tagName !== "LINK" &&
        element.tagName !== "STYLE" &&
        element.tagName !== "PATH" &&
        element.tagName !== "HEADER" &&
        element.tagName !== "FOOTER" &&
        element.tagName !== undefined
    );
}

async function sendElements(value, captured = {}) {

    //result.url = window.location.href;
    //result.title = window.document.title;
    console.log(captured);
    value.captured = captured;
    return chrome.runtime.sendMessage({ request: "capture", value: value }).then(function (completed) {
        console.log("SENT");
        return completed;
    });
}

async function search(value) {
    console.log("STARTING CAPTURE");
    return new Promise(async (resolve, reject) => {
        let lastLength = 0;
        let timeoutId;
        const timeout = 7000;
        var index = 0;
        var linkstore = [];

        // Create the IntersectionObserver
        const observer = new IntersectionObserver(async (entries, observer) => {
            // Loop through the entries
            clearTimeout(timeoutId);
            var found = false;
            entries.forEach(entry => {
                if (!entry.target.classList.contains('nc-processed')) { // check if element has already been processed
                    found = true;
                }
            });

            if (found) {
                let links = getLinks(linkstore);
                linkstore = linkstore.concat(links).slice(-1000);
                let source = window.location.href;
                let origin = new URL(source).origin;
                let images = [...new Set(getImages())];
                captured = { source: source, origin: origin, links: links, text: getText(), images: images, i: index }
                index++;
                sendElements(value, captured);
            }

            entries.forEach(entry => {
                if (excludeProcessed(entry.target)) { // check if element has already been processed
                    entry.target.classList.add('nc-processed');
                }
            });


            window.scrollBy({
                top: window.innerHeight,
            });

            timeoutId = setTimeout(() => {
                observer.disconnect();
                console.log("COMPLETED");
                resolve(true);
            }, timeout);

        }, { threshold: 1 });

        // Function to observe new elements added to the page
        const observeNewElements = () => {
            // Get all elements in the document that haven't been processed yet
            const newElements = document.querySelectorAll('*:not(.nc-processed)');

            // Loop through the new elements and start observing them
            newElements.forEach(element => {
                observer.observe(element);
            });
        }

        // Observe all existing elements on the page
        observer.observe(document.body);

        // Call observeNewElements() whenever new elements are added to the page
        //window.addEventListener('load', observeNewElements);
        window.addEventListener('scroll', observeNewElements);
    });
}

function excludeHeaderAndFooter(element) {
    var rect = element.getBoundingClientRect();
    return rect.top >= 100 && rect.bottom <= document.body.scrollHeight + 100;
}

function excludeProcessed(element) {
    return !element.classList.contains('nc-processed');
}

function getText() {
    var textNodes = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

    // Loop through the text nodes and extract the visible text
    var visibleText = "";
    while (textNodes.nextNode()) {
        var node = textNodes.currentNode;
        if (node.parentElement && targetElement(node.parentNode) && excludeProcessed(node.parentNode) && window.getComputedStyle(node.parentElement).display !== "none") {
            var rect = node.parentElement.getBoundingClientRect();
            var topVisible = rect.top >= 0 && rect.top < window.innerHeight;
            var bottomVisible = rect.bottom > 0 && rect.bottom <= window.innerHeight;
            var isVisible = topVisible || bottomVisible;
            if (isVisible) {
                visibleText += node.textContent.trim() + "<br>";
            }
        }
    }
    visibleText = visibleText.replace(/\n{2,}/g, "<br>");
    // Log the visible text to the console
    console.log(visibleText);
    return visibleText;
}

function getLinks(linkstore) {
    // Get all the links on the page
    var links = document.getElementsByTagName("a");

    // Loop through the links and extract the visible links
    var visibleLinks = [];
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        if (excludeProcessed(link) && excludeHeaderAndFooter(link) && link.offsetWidth > 0 && link.offsetHeight > 0 && window.getComputedStyle(link).display !== "none") {
            visibleLinks.push(link.href);
        }
    }

    // Log the visible links to the console
    console.log(visibleLinks);
    return visibleLinks;
}

function getImages() {
    // Get all the images on the page
    var images = document.getElementsByTagName("img");

    // Loop through the images and extract the visible images
    var visibleImages = [];
    for (var i = 0; i < images.length; i++) {
        var image = images[i];
        if (excludeProcessed(image) && excludeHeaderAndFooter(image) && image.offsetWidth > 0 && image.offsetHeight > 0 && window.getComputedStyle(image).display !== "none") {
            visibleImages.push(image.src);
        }
    }

    // Log the visible links to the console
    console.log(visibleImages);
    return visibleImages;
}
