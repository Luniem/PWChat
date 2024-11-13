const ports = new Set();

onconnect = (connectEvent) => {
    ports.add(connectEvent.ports[0]);
};

onerror = (errorEvent) => {
    console.error(`Error in sharedWorker: ${errorEvent.message}`);
};

setInterval(() => {
    ports.forEach(port => {
        try {
            port.postMessage({ message: new Date().toLocaleString() });
        } catch (err) {
            ports.delete(port);
        }
    });
}, 1000);