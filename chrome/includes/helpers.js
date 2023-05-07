////////// GIT
import { } from './bundle.js';
var defaultText = "Click this icon on a git repository to download contributions to an excel file.\nHover over this to view download progress.";
export async function run() {
    chrome.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
        let url = cloneURL({ url: tabs[0].url });
        if (url) {
            chrome.action.setTitle({title: url + "\nStarted clone"});
            clone({ url: url }).then(function (res) {
                var filename = url.split("/").slice(-2).join("_");
                chrome.action.setTitle({title: url + "\nPreparing download"});
                download(res, filename);
                chrome.action.setTitle({title: defaultText});
            });
        }
        else {
            console.log("invalid url");
            chrome.action.setTitle({title: defaultText});
        }
    });
}

export async function authorize() {
    await setup();
    var session = await getKey("session");
    const url = "__WEB__/subscriptions?client_reference_id=" + chrome.runtime.id + "_" + session.client_reference_id;
    console.log(url);

    const now = new Date();
    const ms = now.getTime() / 1000;

    if (session.client_reference_id && session.subscription_id) {
        if (session.current_period_end && session.current_period_end > ms) {
            return true;
        }
        else {

            const request = '__API__/api/access-tokens';
            const data = {
                subscription_id: session.subscription_id,
            };

            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            };

            return fetch(request, options)
                .then(response => response.json())
                .then(async data => {
                    console.log(data);
                    session.current_period_end = data.current_period_end;
                    session.quantity = data.quantity;
                    await saveKey("session", session);
                    return session.current_period_end > 0;
                })
                .catch(error => {
                    console.error(error);
                    // Handle any errors that occurred during the request
                    chrome.tabs.create({ url: url });
                    return false;
                });
        }
    }
    else {
        chrome.tabs.create({ url: url });
        return false;
    }

}

export async function subscribe(obj) {
    var session = await getKey("session");
    session.subscription_id = obj.subscription_id;
    if (session.client_reference_id) {
        session.client_reference_id = obj.client_reference_id;
    }
    await saveKey("session", session);
    return true;
}

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export async function getKey(key) {
    return chrome.storage.local.get([key]).then(function (result) {
        return result[key];
    });
}

export async function saveKey(key, value) {
    var obj = {}
    obj[key] = value;
    return chrome.storage.local.set(obj).then(function () {
        console.log('stored:', obj);
        return obj;
    });
}

export async function setup() {
    let key = await getKey("session");
    if (!key) {
        await saveKey("session", {
            client_reference_id: uuid()
        });
    }
}

export function download(res, filename) {
    var XLSX = MyModule.XLSX;
    const worksheet = XLSX.utils.json_to_sheet(res);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dates");
    //XLSX.writeFile(workbook, "Presidents.xlsx", { compression: true });

    // convert workbook to binary string
    var binaryString = XLSX.write(workbook, { bookType: "xlsx", type: "binary", compression: true });

    // create blob from binary string
    var blob = new Blob([s2ab(binaryString)], { type: "application/octet-stream" });
    downloadBlobAsDataURL(blob, filename + ".xlsx");
}

function downloadBlobAsDataURL(blob, filename) {
    // use FileReader to convert the Blob to a data URL
    const reader = new FileReader();
    reader.onloadend = function () {
        const dataUrl = reader.result;

        // download the data URL as a file
        chrome.downloads.download({
            url: dataUrl,
            filename: filename
            //saveAs: true
        });
    };
    reader.readAsDataURL(blob);
}


function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}

function flattenObject(obj, prefix = '') {
    return Object.keys(obj).reduce((acc, k) => {
        const pre = prefix.length ? prefix + '.' : '';
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
            Object.assign(acc, flattenObject(obj[k], pre + k));
        } else if (Array.isArray(obj[k])) {
            acc[`${pre}${k}`] = obj[k].join(', ');
        } else {
            acc[`${pre}${k}`] = obj[k];
        }
        return acc;
    }, {});
}

export function cloneURL({ url: url }) {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(part => part !== ''); // remove empty parts
    if (pathParts.length >= 2) {
        return `${urlObj.origin}/${pathParts[0]}/${pathParts[1]}`;
    } else {
        return null;
    }
}

export async function clone({ url: url }) {
    // Load the script files
    
    var fs = new MyModule.fs('fs')
    var pfs = fs.promises;
    const rand = Math.floor(Math.random() * 100000) + 1;
    const dir = "/git-" + Date.now();
    const http = MyModule.http;
    console.log("STARTING CLONE OF " + url + " TO " + dir);
            
    try {
        await pfs.mkdir(dir);
    }
    catch (err) { 
        console.error('Error creating directory:', err)
    }           
            
    await MyModule.git.clone({
        fs, 
        http,   
        dir: dir,
        //corsProxy: 'https://cors.isomorphic-git.org',
        url: url,
        cache: {},
        singleBranch: true,
        force: true,
        noCheckout: true,
        onProgress: event => {
            chrome.action.setTitle({title: url + "\n" + event.phase + ": " + Math.round(event.loaded/event.total * 100) + "%"});
            console.log(event.phase,event.loaded,event.total);
        }
    });         
    console.log("CLONED");
    chrome.action.setTitle({title: url + "\nOpening log"});
    let commits = await MyModule.git.log({ fs, dir: dir});
    commits = commits.map((c) => {
        c.commit.id = c.oid;
        delete c.commit.gpgsig;
        console.log(c.commit);
        return flattenObject(c.commit);
    });         

    console.log(commits);
    return commits; 
}       
