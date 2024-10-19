
const nav = document.getElementsByTagName("nav")[0];
const chatButton = document.getElementById("chat-button");
const userButton = document.getElementById("user-button");

chatButton.addEventListener('click', () => activateButton(chatButton));
userButton.addEventListener('click', () => activateButton(userButton));

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