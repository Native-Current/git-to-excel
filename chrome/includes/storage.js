/////////// Storage
export const DATABASE = {
    name: "ncdb",
    version: 1
}

// TODO - make sure save for flow_results is sent with key of flow_id for retrieval at top level
export async function save({ data: data, to: to }) {
    console.log(data, to);

    // Open a connection to the database
    var request = indexedDB.open(DATABASE.name, DATABASE.version);

    // Handle database errors
    request.onerror = function (event) {
        console.error("Database error: " + event.target.error);
        db.close();
    };

    // Create an object store and add data to it
    request.onupgradeneeded = async function (event) {
        var db = event.to.result;
        var objectStore = db.createObjectStore(to, { keyPath: 'id' });
        objectStore.put(data);
        console.log("ADDED FROM UPGRADE");
        db.close();
    };

    // Write data to the object store
    request.onsuccess = async function (event) {
        var db = event.target.result;
        var transaction = db.transaction(to, 'readwrite');
        var objectStore = transaction.objectStore(to);
        console.log("ADDING TO STORE");
        objectStore.put(data);
        transaction.oncomplete = function () {
            console.log('Data successfully written to IndexedDB from the background script');
            db.close();
        };
        transaction.onerror = function (event) {
            console.error('Error writing data to IndexedDB from the background script', event.target.error);
            db.close();
        }
    };
}

export async function load({ key: key, from: from }) {
    console.log(key, from);
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DATABASE.name, DATABASE.version);
        request.onerror = (event) => {
            event.target.result.close();
            reject(event.target.error);
        };
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(from, 'readonly');
            const objectStore = transaction.objectStore(from);
            var getDataRequest = null;
            if (key) {
                getDataRequest = objectStore.get(key);
            }
            else {
                getDataRequest = objectStore.getAll();
            }
            getDataRequest.onerror = (event) => {
                db.close();
                reject(event.target.error);
            };
            getDataRequest.onsuccess = (event) => {
                db.close();
                if (key) {
                    resolve([event.target.result]);
                }
                else {
                    resolve(event.target.result);
                }
            };
        };
    });
}

export async function remove({ key: key, from: from }) {
    console.log(key, from);
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DATABASE.name, DATABASE.version);
        request.onerror = (event) => {
            event.target.result.close();
            reject(event.target.error);
        };
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(from, 'readwrite');
            const objectStore = transaction.objectStore(from);
            var deleteRequest = objectStore.delete(key);
            deleteRequest.onerror = (event) => {
                db.close();
                reject(event.target.error);
            };
            deleteRequest.onsuccess = (event) => {
                db.close();
                console.log(event.target.result);
                resolve(event.target.result);
            };
        };
    });
}

export async function clear({from: from}){
    // Open a connection to the IndexedDB database
    const request = indexedDB.open(DATABASE.name, DATABASE.version);

    // When the database is opened successfully
    request.onsuccess = function(event) {
        const db = event.target.result;

        // Open a transaction and get the object store
        const transaction = db.transaction(from, 'readwrite');
        const objectStore = transaction.objectStore(from);

        // Use the clear() method to remove all records from the object store
        objectStore.clear();

        // Close the transaction and the database connection
        transaction.oncomplete = function(event) {
            db.close();
        };
    };
}

export async function setupDB() {
    console.log("SETTING UP DB");
    let request = indexedDB.open(DATABASE.name, DATABASE.version);
    request.onupgradeneeded = function (event) {
        let db = event.target.result;
        db.createObjectStore('links', { keyPath: 'id' });
        db.createObjectStore('searches', { keyPath: 'id' });
    };
    request.onsuccess = function (event) {
        // Database connection successful
        console.log("SUCCESS");
    };
    request.onerror = function (event) {
        // Handle error
        console.log(event.target.error);
    };
}
