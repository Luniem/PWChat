let installerButton;
let onlineStatusLabel;
let conversationList;
let convoBoxTemplate;

const LAST_SELECTED_CONVERSATION_KEY = 'lastSelectedConversation';

// catch pwa-install event
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installerButton.removeAttribute('hidden');
});

async function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt = null;
        installerButton.setAttribute('hidden', '');
    }
}

window.addEventListener('online', (event) => updateOnlineStatus(event.type === 'online'));
window.addEventListener('offline', (event) => updateOnlineStatus(event.type === 'online'));

document.addEventListener('DOMContentLoaded', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js');
    }

    // initialize all DOM-variables
    intializeDOMElements();

    updateOnlineStatus(navigator.onLine);

    fetch('/users').then((response) => {
        response.json().then((users) => {
            users.forEach((user) => {
                clonedConvoBoxed = convoBoxTemplate.content.cloneNode(true);
                clonedConvoBoxed.querySelector('[data-image]').src = user.image;
                clonedConvoBoxed.querySelector('[data-username]').innerText = user.username;
                clonedConvoBoxed.querySelector('[data-fullname]').innerText = user.fullname;

                // put a click-event on the div
                clonedConvoBoxed.querySelector('div').addEventListener('click', () => {
                    selectConversation(user);
                });

                // TODO: merge this with convos and show last message
                conversationList.appendChild(clonedConvoBoxed);
            });

            navigator
                .setAppBadge(users.length)
                .then(() => {
                    console.log('Badge set');
                })
                .catch((error) => {
                    console.error('Badge error', error);
                });
        });
    });
});

function intializeDOMElements() {
    installerButton = document.getElementById('installButton');
    onlineStatusLabel = document.getElementById('onlineStatus');
    convoBoxTemplate = document.getElementById('convo-box-template');
    conversationList = document.getElementById('conversations');
}

function updateOnlineStatus(isOnline) {
    onlineStatusLabel.innerText = isOnline ? 'Online' : 'Offline';

    const toRemove = isOnline ? 'offline' : 'online';
    const toAdd = isOnline ? 'online' : 'offline';
    onlineStatusLabel.classList.remove(toRemove);
    onlineStatusLabel.classList.add(toAdd);
}

function selectConversation(user) {
    localStorage.setItem(LAST_SELECTED_CONVERSATION_KEY, JSON.stringify(user.username));
}
