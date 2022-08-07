let array = [];

self.addEventListener('message', (e) => {
    if (e.data === 'download') {
        const blob = new Blob(array);
        self.postMessage(blob);
        array = [];
    } else {
        array.push(e.data);
    }
})