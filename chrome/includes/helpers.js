////////// GIT
import { } from './bundle.js';

export function download(res,filename){
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
    reader.onloadend = function() {
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
        corsProxy: 'https://cors.isomorphic-git.org',
        url: url,
        singleBranch: true,
        force: true,
        noCheckout: true
    });
    console.log("CLONED");

    let files = await MyModule.git.listFiles({ fs, dir: dir, ref: 'HEAD' });
    console.log(files);
    var result = await Promise.all(
        files.map((f) => {
            return MyModule.git.log({ fs, dir: dir, filepath: f }).then(function (commits) {
                return commits.map((c) => {
                    c.commit.file = f;
                    c.commit.id = c.oid;
                    c.commit.gpgsig = null;
                    return c.commit;
                });
            });
        })
    );
    result = result
        .flat()
        .reduce((grouped, { id, file, ...rest }) => {
            const group = grouped.get(id) || { id, files: [] };
            group.files.push(file);
            return grouped.set(id, { ...group, ...rest });
        }, new Map());

    const resultArray = Array.from(result.values()).map(c => {
        return flattenObject(c);
    });

    console.log(resultArray);
    return resultArray;
}
