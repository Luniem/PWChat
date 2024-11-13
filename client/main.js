let installerButton;
let onlineStatusLabel;
let conversationList;
let convoBoxTemplate;
let noChat;
let chat;
let selectedChatImage;
let selectedChatName;
let selectedChatUserName;
let messageList;
let messageInput;

let currentUser;
let allUsers;

const CURRENT_USER_KEY = 'currentUser';
const LAST_SELECTED_CONVERSATION_KEY = 'lastSelectedConversation';

function writeWorkerMessages(htmlId, message) {
    const htmlElement = document.getElementById(htmlId);
    if(htmlElement) {
        htmlElement.innerText = message;
    }
}

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

// subscribe to SSE
const eventSource = new EventSource('/messageEvent');
eventSource.addEventListener('newMessageCount', (event) => {
    const newMessageCount = parseInt(event.data);
    if (!isNaN(newMessageCount) && navigator.setAppBadge) {
        navigator.setAppBadge(newMessageCount);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // initialize all DOM-variables
    intializeDOMElements();
    updateOnlineStatus(navigator.onLine);

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js');
    }

    if("Worker" in window) {
        const dedicatedWorker = new Worker('dedicated-worker.js');
        dedicatedWorker.onmessage = (event) => writeWorkerMessages('time-running', event.data.message);
    } else {
        writeWorkerMessages('time-running', 'Not supported');
    }
    
    if("SharedWorker" in window) {
        const sharedWorker = new SharedWorker('shared-worker.js');
        sharedWorker.port.start();
        sharedWorker.port.onmessage = (event) => writeWorkerMessages('current-time', event.data.message);
    } else {
        writeWorkerMessages('current-time', 'Not supported');
    }

    // check for action (clear last opened chat or more)
    executeAction();

    // fetch all users
    fetch('/users').then((response) => {
        response.json().then((users) => {
            allUsers = users;

            // check if there is a last selected conversation
            const lastSelectedConversation = localStorage.getItem(LAST_SELECTED_CONVERSATION_KEY);
            if (lastSelectedConversation) {
                const { username, convoId } = JSON.parse(lastSelectedConversation);
                const user = users.find(u => u.username === username);
                if (user) {
                    openChat(user, convoId);
                }
            }

            // define current selected user
            currentUser = localStorage.getItem(CURRENT_USER_KEY);
            if (!currentUser) {
                currentUser = users[0].username;
                localStorage.setItem(CURRENT_USER_KEY, currentUser);
            }
        }).then(() => {
            // fetch all conversations
            fetch(`/conversations?user=${currentUser}`).then((response) => {
                response.json().then((conversations) => {
                        conversations.forEach((convo) => {
                            const otherUser = allUsers.find(u => u.username === convo.participants.find(p => p !== currentUser));
                            createConvoBox(otherUser, convo.id);
                        });
                });
            });
        });
    });
});

function executeAction() {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');

    if (action === 'reset-last-chat') {
        localStorage.removeItem(LAST_SELECTED_CONVERSATION_KEY);
    }

    // remove the action from the url
    const url = new URL(window.location);
    url.searchParams.delete('action');
    window.history.replaceState({}, '', url);
}

function intializeDOMElements() {
    installerButton = document.getElementById('installButton');
    onlineStatusLabel = document.getElementById('onlineStatus');
    convoBoxTemplate = document.getElementById('convo-box-template');
    conversationList = document.getElementById('conversations');
    noChatInfo = document.getElementById('no-chat');
    chat = document.getElementById('chat');
    selectedChatImage = document.getElementById('selected-chat-image');
    selectedChatName = document.getElementById('selected-chat-name');
    selectedChatUserName = document.getElementById('selected-chat-username');
    messageList = document.getElementById('message-list');
    messageInput = document.getElementById('message-input');

    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
}

function updateOnlineStatus(isOnline) {
    onlineStatusLabel.innerText = isOnline ? 'Online' : 'Offline';

    const toRemove = isOnline ? 'offline' : 'online';
    const toAdd = isOnline ? 'online' : 'offline';
    onlineStatusLabel.classList.remove(toRemove);
    onlineStatusLabel.classList.add(toAdd);
}

function createConvoBox(user, convoId) {
    clonedConvoBoxed = convoBoxTemplate.content.cloneNode(true);
    clonedConvoBoxed.querySelector('[data-image]').src = user.image;
    clonedConvoBoxed.querySelector('[data-username]').innerText = user.username;
    clonedConvoBoxed.querySelector('[data-fullname]').innerText = user.fullname;

    // put a click-event on the div
    clonedConvoBoxed.querySelector('div').addEventListener('click', () => {
        openChat(user, convoId);
    });

    // TODO: merge this with convos and show last message
    conversationList.appendChild(clonedConvoBoxed);
}

function storeOpenedChat(user, convoId) {
    localStorage.setItem(LAST_SELECTED_CONVERSATION_KEY, JSON.stringify({username: user.username, convoId: convoId}));
}

function openChat(user, convoId) {
    // save in localstorage
    storeOpenedChat(user, convoId);
    
    //clear all messages
    messageList.innerHTML = '';

    // remove the no chat info and show the chat
    noChatInfo.classList.add('hidden');
    chat.classList.remove('hidden');

    // update the selected chat image and name
    selectedChatImage.src = user.image;
    selectedChatName.innerText = user.fullname;
    selectedChatUserName.innerText = user.username;

    // load convo
    fetch(`/conversations/${convoId}/messages`).then((response) => {
        response.json().then((conversations) => {
            // add all messages
            conversations.forEach((message) => {
                addMessage(message.message, message.from === currentUser);
            });

            // scroll to last message
            scrollToLastMessage();
        });
    });
}

function addMessage(message, isCurrentUser) {
    const clonedMessage = document.getElementById('message-template').content.cloneNode(true);
    clonedMessage.querySelector('span').innerText = message;
    if(isCurrentUser) {
        clonedMessage.querySelector('div').classList.add('own-message');
    }

    messageList.appendChild(clonedMessage);
}

function sendMessage() {
    const text = messageInput.value.trim();
    if(text !== '' && navigator.onLine) {
        // get the convoId
        const convoId = JSON.parse(localStorage.getItem(LAST_SELECTED_CONVERSATION_KEY)).convoId;
        const message = {from: currentUser, message: text};

        // add message to the chat
        fetch(`/conversations/${convoId}/messages`, {method: 'POST', body: JSON.stringify(message), headers: {'Content-Type': 'application/json'}})
            .then((response) => {
                if(response.ok) {
                    messageInput.value = '';
                    addMessage(message.message, true);
                    scrollToLastMessage();
                } else {
                    console.error('Could not send message');
                }
        });
    }
}

function scrollToLastMessage() {
    messageList.scrollTop = messageList.scrollHeight;
}