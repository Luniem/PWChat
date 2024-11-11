let installerButton;
let onlineStatusLabel;

// catch pwa-install event
let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installerButton.removeAttribute("hidden");
});

async function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt = null;
        installerButton.setAttribute("hidden", "");
    }
}

window.addEventListener("online", (event) =>
    updateOnlineStatus(event.type === "online")
);
window.addEventListener("offline", (event) =>
    updateOnlineStatus(event.type === "online")
);

document.addEventListener("DOMContentLoaded", () => {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js");
    }

    // initialize all DOM-variables
    intializeDOMElements();

    updateOnlineStatus(navigator.onLine);
});

function intializeDOMElements() {
    installerButton = document.getElementById("installButton");
    onlineStatusLabel = document.getElementById("onlineStatus");
}

function updateOnlineStatus(isOnline) {
    onlineStatusLabel.innerText = isOnline ? "Online" : "Offline";
    //TODO: Different color?
}
