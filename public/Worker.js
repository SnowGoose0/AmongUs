let array = [];

self.addEventListener('message', (e) => {
    if (e.data === 'download') {
        const blob = new Blob(array);
        self.postMessage(blob);
        console
        array = [];
    } else if (e.data === 'reject') {
        array = [];
    } else {
        array.push(e.data);
    }
})