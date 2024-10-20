
const nav = document.getElementsByTagName("nav")[0];
const chatButton = document.getElementById("chat-button");
const userButton = document.getElementById("user-button");
const settingButton = document.getElementById("setting-button");

const convoList = document.getElementById("convo-list");
const convoTemplate = document.getElementById("convo-template");

const selectedConvoArea = document.getElementById("selected-convo-area");
const noConvoSelected = document.getElementById("no-convo-selected");

const messageList = document.getElementById("message-list");
const messageTemplate = document.getElementById("message-template");
const headerImg = document.getElementsByClassName("convo-header")[0].querySelector("img");
const headerName = document.getElementsByClassName("convo-header")[0].querySelector("h4");


let selectedChat;
const currentUser = "daniel";

chatButton.addEventListener('click', () => activateButton(chatButton));
userButton.addEventListener('click', () => activateButton(userButton));
settingButton.addEventListener('click', () => activateButton(settingButton));

loadConversations();

function loadConversations() {
    fetch("http://localhost:5000/conversations?user=" + currentUser).then((convoResponse) => {
        if(convoResponse.status === 200) {
            convoResponse.json().then((convos) => {                
                convos.forEach((convo) => {
                    fetch("http://localhost:5000/conversations/" + convo.id + "/messages").then((messageResponse) => {
                        messageResponse.json().then((messages) => {
                            createConvoBox(convo, messages);
                        })
                    })
                })
            })
        }
    })
}

function createConvoBox(convo, messages) {
    // get box from template
    const convoBox = convoTemplate.content.querySelector("div");

    // get name of partner
    let convoPartnerName;
    const myIndex = convo.participants.findIndex(p => p === currentUser);
    if(myIndex !== -1) {
        convoPartnerName === 0 ? convo.participants.pop() : convo.participants.shift();
    }
    
    // copy template box
    const copy = document.importNode(convoBox, true);
    copy.dataset.convoId = convo.id;

    // get elements in box
    const img = copy.querySelector("img");
    const name = copy.querySelector("h4");
    const message = copy.querySelector("span");

    // fill with content
    img.src = img.src + convo.participants[0] + ".jpg";
    name.innerText = convo.participants[0];
    message.innerText = messages[messages.length -1].message;

    // add on-click event
    copy.onclick = () => selectChat(convo.id);

    // add to DOM
    convoList.append(copy);
}

function selectChat(id) {
    let currActive;
    let newActive;
    if(id == selectedChat) return;

    [...convoList.children].forEach((child) => {
        if (selectedChat === child.dataset.convoId) currActive = child;
        if (id == child.dataset.convoId) newActive = child;
    })

    if(currActive) {
        currActive.classList.toggle("active");
    }
    
    newActive.classList.toggle("active");
    selectedChat = newActive.dataset.convoId;
    refreshMessageWindow();
}

function refreshMessageWindow() {
    if (selectedChat === undefined) {
        selectedConvoArea.classList.add("hidden");
        noConvoSelected.classList.remove("hidden")
    } else {
        selectedConvoArea.classList.remove("hidden");
        noConvoSelected.classList.add("hidden")

        messageList.innerHTML = "";
        
        fetch("http://localhost:5000/conversations/" + selectedChat + "/messages").then((response) => {
            response.json().then((messages) => {
                messages.forEach((message) => {
                    console.log(messages);
                    // get box from template
                    const messageBox = messageTemplate.content.querySelector("div");
                    
                    // copy template box
                    const copy = document.importNode(messageBox, true);
                    
                    // get elements in box
                    const span = copy.querySelector("span");
                    
                    // fill with content
                    span.innerText = message.message;
                    
                    if(message.from === currentUser) {
                        copy.classList.add("own-message");
                    } else {
                        copy.classList.add("partner-message");
                    }
                    
                    // set header
                    headerImg.src = "images/" + message.from + ".jpg";
                    headerName.innerText = message.from;

                    // add to DOM
                    messageList.append(copy);
                })
            })
        })
    }
}

function activateButton(button) {
    const activeButton = getCurrentActiveNavItem();
    activeButton.classList.toggle("active");
    button.classList.toggle("active")
}

function getCurrentActiveNavItem() {
    for(let i = 0; i < nav.children.length; i++) {
        const currItem = nav.children.item(i);
        if (currItem.classList.contains("active")) return currItem;
    }
}